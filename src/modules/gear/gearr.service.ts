import type { GearItemWhereInput } from "../../../prisma/generated/prisma/models";
import { prisma } from "../../lib/prisma";
import type {
  ICreateGear,
  IGearFilterRequest,
  IUpdateGear,
} from "./gear.interface";

const getGearItem = async (filters: IGearFilterRequest) => {
  const {
    searchTerm,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

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

  const gearItems = await prisma.gearItem.findMany({
    where: {
      AND: andConditions,
    },
    skip,
    take: limitNumber,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
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
    },
  });

  const totalGearCount = await prisma.gearItem.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: gearItems,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total: totalGearCount,
      totalPages: Math.ceil(pageNumber / limitNumber),
    },
  };
};

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

const deleteGear = async (gearId: string, userId: string) => {
  const existingGear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!existingGear) {
    throw new Error("Gear item not found.");
  }

  if (existingGear.providerId !== userId) {
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
};
