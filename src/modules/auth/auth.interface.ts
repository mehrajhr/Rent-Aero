import type { Role } from "../../../prisma/generated/prisma/enums";

export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUpdateUser {
  name ?: string,
  email ?: string,
  role ?: Role
}