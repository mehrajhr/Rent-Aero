import bcrypt from "bcryptjs";
import { Role } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { IRegisterUser } from "./auth.interface";
import config from "../../config";

const registerUserInDB = async (payload: IRegisterUser) => {
  const { name, email, password, role } = payload;

  if (role === Role.ADMIN) {
    throw new Error(
      "Unauthorized: You cannot register as an admin through this route!",
    );
  }

  if (role && role !== Role.CUSTOMER && role !== Role.PROVIDER) {
    throw new Error(
      "Invalid role provided. Allowed roles are CUSTOMER or PROVIDER.",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const hashPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const assginedRole = role === Role.PROVIDER ? Role.PROVIDER : Role.CUSTOMER;

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      role: assginedRole,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const authService = {
  registerUserInDB,
};
