import { OrderStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";

export const RESERVING_ORDER_STATUSES = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
  OrderStatus.PICKED_UP,
];

export interface RentalDateRange {
  start: Date;
  end: Date;
}

export function parseRentalDateRange(
  startDate: unknown,
  endDate: unknown,
): RentalDateRange {
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    throw new Error("Both startDate and endDate are required.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Rental dates must be valid dates.");
  }
  if (start >= end) {
    throw new Error("End date must be greater than start date.");
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startDay = new Date(start);
  startDay.setUTCHours(0, 0, 0, 0);
  if (startDay < today) {
    throw new Error("Start date cannot be in the past.");
  }

  return { start, end };
}

export async function getBookedQuantitiesByGear(
  gearIds: string[],
  range: RentalDateRange,
) {
  if (gearIds.length === 0) return new Map<string, number>();

  const bookings = await prisma.rentalItem.groupBy({
    by: ["gearId"],
    where: {
      gearId: { in: gearIds },
      order: {
        status: { in: RESERVING_ORDER_STATUSES },
        startDate: { lt: range.end },
        endDate: { gt: range.start },
      },
    },
    _sum: { quantity: true },
  });

  return new Map(
    bookings.map((booking) => [booking.gearId, booking._sum.quantity ?? 0]),
  );
}

export async function getGearAvailability(
  gearId: string,
  startDate: unknown,
  endDate: unknown,
) {
  const range = parseRentalDateRange(startDate, endDate);
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
    select: { id: true, stock: true, isAvailable: true },
  });

  if (!gear) {
    throw new Error("Gear item not found.");
  }

  const bookedQuantities = await getBookedQuantitiesByGear([gear.id], range);
  const bookedQuantity = bookedQuantities.get(gear.id) ?? 0;
  const availableStock = gear.isAvailable
    ? Math.max(0, gear.stock - bookedQuantity)
    : 0;

  return {
    gearId: gear.id,
    startDate: range.start,
    endDate: range.end,
    stock: gear.stock,
    bookedQuantity,
    availableStock,
    isAvailable: availableStock > 0,
  };
}
