import { prisma } from "../../lib/prisma";
import type { ICreateCategory } from "./category.interface";

const createCategory = async (payload: ICreateCategory) => {
  const { name, slug, isActive } = payload;
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existingCategory) {
    throw new Error("Category with this name or slug already exists.");
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      isActive: isActive !== undefined ? isActive : true,
    },
  });

  return category;
};

export const categoryService = {
  createCategory,
};
