import type { GearItemWhereInput } from "../../../prisma/generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type {
  ICreateGear,
  IGearFilterRequest,
  IUpdateGear,
} from "./gear.interface";
import {
  getBookedQuantitiesByGear,
  getGearAvailability,
  parseRentalDateRange,
} from "./gearAvailability";

const getGearItem = async (filters: IGearFilterRequest) => {
  const {
    searchTerm,
    category,
    brand,
    minPrice,
    maxPrice,
    isAvailable,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const dateRange =
    startDate !== undefined || endDate !== undefined
      ? parseRentalDateRange(startDate, endDate)
      : null;

  const andConditions: GearItemWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (category) {
    andConditions.push({
      category: {
        OR: [
          {
            name: category,
          },
          {
            slug: category,
          },
        ],
      },
    });
  }

  if (brand) {
    andConditions.push({
      brand: {
        contains: brand,
        mode: "insensitive",
      },
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      pricePerDay: {
        ...(minPrice !== undefined && { gte: Number(minPrice) }),
        ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
      },
    });
  }

  if (isAvailable !== undefined) {
    const availableBoolean =
      typeof isAvailable === "string" ? isAvailable === "true" : isAvailable;

    andConditions.push({
      isAvailable: availableBoolean,
    });
  }

  if (dateRange) {
    andConditions.push({ isAvailable: true });
  }

  const where = { AND: andConditions };
  const include = {
    provider: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    reviews: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    },
  };

  let gearItems;
  let totalGearCount: number;

  if (dateRange) {
    const candidates = await prisma.gearItem.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include,
    });
    const bookedQuantities = await getBookedQuantitiesByGear(
      candidates.map((gear) => gear.id),
      dateRange,
    );
    const availableGearItems = candidates
      .map((gear) => ({
        ...gear,
        availableStock: Math.max(
          0,
          gear.stock - (bookedQuantities.get(gear.id) ?? 0),
        ),
      }))
      .filter((gear) => gear.availableStock > 0);

    totalGearCount = availableGearItems.length;
    gearItems = availableGearItems.slice(skip, skip + limitNumber);
  } else {
    [gearItems, totalGearCount] = await Promise.all([
      prisma.gearItem.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { [sortBy]: sortOrder },
        include,
      }),
      prisma.gearItem.count({ where }),
    ]);
  }

  const processedGearItems = gearItems.map((gear) => {
    const totalReviews = gear.reviews.length;
    const averageRating =
      totalReviews > 0
        ? gear.reviews.reduce((acc, rev) => acc + rev.rating!, 0) / totalReviews
        : 0;
    return {
      ...gear,
      averageRating: Number(averageRating.toFixed(1)), // যেমন: 4.5
      totalReviews,
    };
  });

  return {
    data: processedGearItems,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total: totalGearCount,
      totalPages: Math.ceil(totalGearCount / limitNumber),
    },
  };
};

const getSingleGearItem = async (id: string) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      provider: { select: { id: true, name: true, email: true } },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!gearItem) {
    throw new Error("Gear item not found.");
  }
  const totalReviews = gearItem.reviews.length;
  const averageRating =
    totalReviews > 0
      ? gearItem.reviews.reduce((acc, rev) => acc + rev.rating!, 0) /
        totalReviews
      : 0;

  return { ...gearItem, totalReviews, averageRating };
};

const getMyGearsFromDB = async (providerId: string) => {
  const result = await prisma.gearItem.findMany({
    where: {
      providerId: providerId,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const getAvailabilityForGear = async (
  gearId: string,
  startDate: unknown,
  endDate: unknown,
) => getGearAvailability(gearId, startDate, endDate);

const createGear = async (providerId: string, payload: ICreateGear) => {
  const {
    name,
    description,
    brand,
    pricePerDay,
    stock,
    isAvailable,
    specifications,
    categoryId,
  } = payload;

  if (
    !name ||
    !description ||
    !brand ||
    pricePerDay === undefined ||
    !categoryId
  ) {
    throw new Error(
      "All required fields (name, description, brand, pricePerDay, categoryId) must be provided.",
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  if (!category.isActive) {
    throw new Error("Cannot add gear to an inactive or deleted category.");
  }

  const gearItem = await prisma.gearItem.create({
    data: {
      name,
      description,
      brand,
      pricePerDay,
      stock,
      isAvailable,
      specifications,
      categoryId,
      providerId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return gearItem;
};

const updateGear = async (
  gearId: string,
  userId: string,
  payload: IUpdateGear,
) => {
  const existingGear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!existingGear) {
    throw new Error("Gear item not found.");
  }

  if (existingGear.providerId !== userId) {
    throw new Error(
      "Unauthorized: You do not have permission to update this gear item.",
    );
  }

  const {
    name,
    description,
    brand,
    pricePerDay,
    stock,
    isAvailable,
    specifications,
    categoryId,
  } = payload;

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.isActive) {
      throw new Error("Category not found or inactive.");
    }
  }

  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: {
      name,
      description,
      brand,
      pricePerDay,
      stock,
      isAvailable,
      specifications,
      categoryId,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      provider: { select: { id: true, name: true, email: true } },
    },
  });

  return updatedGear;
};

const deleteGear = async (gearId: string, userId: string, role: string) => {
  const existingGear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!existingGear) {
    throw new Error("Gear item not found.");
  }

  if (existingGear.providerId !== userId && role !== "ADMIN") {
    throw new Error(
      "Unauthorized: You do not have permission to delete this gear item.",
    );
  }

  await prisma.gearItem.delete({
    where: { id: gearId },
  });
};

export const gearService = {
  createGear,
  updateGear,
  deleteGear,
  getGearItem,
  getSingleGearItem,
  getMyGearsFromDB,
  getAvailabilityForGear,
};
