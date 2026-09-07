import type { Prisma, Role } from "../../../prisma/generated/prisma/browser";
import { OrderStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { ICreateRentalPayload } from "./rentalOrders.interface";

const createRentalOrders = async (
  customerId: string,
  payload: ICreateRentalPayload,
) => {
  const { startDate, endDate, items } = payload;

  if (!startDate || !endDate || !items || items.length === 0) {
    throw new Error("Start date, end date, and items are required.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (start < now) {
    throw new Error("Start date cannot be in the past.");
  }

  if (start >= end) {
    throw new Error("End date must be greater than start date.");
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  let totalAmount = 0;
  const rentalItemsData: Prisma.RentalItemUncheckedCreateWithoutOrderInput[] =
    [];
  let firstProviderId: string | null = null;

  for (const item of items) {
    const quantity = item.quantity || 1;

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error("Item quantity must be a positive integer.");
    }
    const gearItem = await prisma.gearItem.findUnique({
      where: {
        id: item.gearId,
      },
    });

    if (!gearItem) {
      throw new Error(`Gear item with ID ${item.gearId} not found.`);
    }

    if (!gearItem.isAvailable) {
      throw new Error(
        `Gear item "${gearItem.name}" is currently not available.`,
      );
    }

    if (gearItem.providerId === customerId) {
      throw new Error("You cannot rent your own gear items.");
    }

    if (firstProviderId === null) {
      firstProviderId = gearItem.providerId;
    } else if (gearItem.providerId !== firstProviderId) {
      throw new Error(
        "You cannot rent items from multiple providers in a single order. Please place separate orders.",
      );
    }

    const existingBookings = await prisma.rentalItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        gearId: item.gearId,
        order: {
          status: {
            in: [
              OrderStatus.PLACED,
              OrderStatus.CONFIRMED,
              OrderStatus.PAID,
              OrderStatus.PICKED_UP,
            ],
          },
          startDate: { lt: end },
          endDate: { gt: start },
        },
      },
    });

    const bookedQuantity = existingBookings._sum.quantity || 0;
    const totalStock = gearItem.stock || 1;
    const availableStock = totalStock - bookedQuantity;

    if (quantity > availableStock) {
      throw new Error(
        `Only ${availableStock > 0 ? availableStock : 0} unit(s) of "${gearItem.name}" available for the selected date range.`,
      );
    }
    const itemTotal = gearItem.pricePerDay * quantity * diffDays;
    totalAmount += itemTotal;

    rentalItemsData.push({
      gearId: item.gearId,
      quantity,
      priceAtRental: gearItem.pricePerDay,
    });
  }

  if (!firstProviderId) {
    throw new Error("Provider could not be determined for this order.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const rentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        providerId: firstProviderId,
        startDate: start,
        endDate: end,
        totalAmount,
        status: OrderStatus.PLACED,
        items: {
          create: rentalItemsData,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            gear: true,
          },
        },
      },
    });

    return rentalOrder;
  });

  return result;
};

const getMyRentals = async (customerId: string) => {
  const rentals = await prisma.rentalOrder.findMany({
    where: {
      customerId,
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          gear: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rentals;
};

const getProviderRentalOrders = async (providerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      providerId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          gear: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

const getAllRentalOrdersForAdmin = async () => {
  const rentalOrders = await prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      items: {
        include: {
          gear: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return rentalOrders;
};

const updateOrderStatus = async (
  orderId: string,
  userId: string,
  newStatus: OrderStatus,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.customerId === userId) {
    if (newStatus !== OrderStatus.CANCELLED) {
      throw new Error("Customers can only cancel their orders.");
    }
    if (order.status !== OrderStatus.PLACED) {
      throw new Error(
        "You can only cancel an order that is in 'PLACED' status.",
      );
    }

    return await prisma.rentalOrder.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  if (order.providerId === userId) {
    const allowedProviderStatuses = [
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
      OrderStatus.PICKED_UP,
      OrderStatus.RETURNED,
    ];

    if (!allowedProviderStatuses.includes(newStatus as any)) {
      throw new Error(
        "You are not authorized to set this status as a provider.",
      );
    }

    return await prisma.rentalOrder.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
  }

  throw new Error("You do not have permission to update this order.");
};

export const rentalOrdersService = {
  createRentalOrders,
  getMyRentals,
  getProviderRentalOrders,
  getAllRentalOrdersForAdmin,
  updateOrderStatus
};

