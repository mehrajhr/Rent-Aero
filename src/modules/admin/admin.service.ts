import { UserStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAllUser = async () => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

const updateUserStatus = async (id: string, status: UserStatus) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  if (status !== UserStatus.ACTIVE && status !== UserStatus.SUSPENDED) {
    throw new Error(
      "Invalid status. Allowed statuses are ACTIVE or SUSPENDED.",
    );
  }

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

export const adminService = {
  getAllUser,
  updateUserStatus
};
