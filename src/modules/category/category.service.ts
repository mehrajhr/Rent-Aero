import { prisma } from "../../lib/prisma";
import type { ICreateCategory, IUpdateCategory } from "./category.interface";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

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

const updateCategory = async (id: string, payload: IUpdateCategory) => {
  const { name, slug, isActive } = payload;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Category not found.");
  }

  if (name !== undefined || slug !== undefined) {
    const conflict = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [...(name ? [{ name }] : []), ...(slug ? [{ slug }] : [])],
          },
        ],
      },
    });

    if (conflict) {
      throw new Error(
        "Another category with this name or slug already exists.",
      );
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return updatedCategory;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategory
};
