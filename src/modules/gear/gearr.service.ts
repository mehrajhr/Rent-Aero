import { prisma } from "../../lib/prisma";
import type { ICreateGear } from "./gear.interface";

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

export const gearService = {
  createGear,
};
