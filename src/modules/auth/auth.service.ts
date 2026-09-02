import bcrypt from "bcryptjs";
import { Role, UserStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { ILoginUser, IRegisterUser } from "./auth.interface";
import config from "../../config";
import { jwtUtils } from "../../utils/jwtUtils";
import type { SignOptions } from "jsonwebtoken";

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

const loginUserInDB = async (payload: ILoginUser) => {
  //   console.log(payload);
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error(
      "Email is invalid. This is user doesn't exist in our system!",
    );
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new Error("Your account has been suspended. Please contact support.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Password is incorrect!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiresin as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiresin as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerUserInDB,
  loginUserInDB,
};
