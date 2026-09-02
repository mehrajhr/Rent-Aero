import type { Role } from "../../../prisma/generated/prisma/enums";

export interface IRegisterUser {
    name : string,
    email : string,
    password : string,
    role ?: Role
}