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

export const adminService = {
  getAllUser,
};
