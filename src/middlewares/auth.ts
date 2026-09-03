import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../prisma/generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwtUtils";
import config from "../config";
import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization);

    if (!token) {
      throw new Error(
        "You are not logged in! Please login to access this resource.",
      );
    }

    const verfiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (!verfiedToken.success) {
      throw new Error(verfiedToken.message);
    }

    const { email, id, name, role } = verfiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden! You don't have permission to access this resource.",
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (user.status === "SUSPENDED") {
      throw new Error(
        "Your account has been suspended. Please contact support.",
      );
    }

    req.user = {
      email,
      name,
      id,
      role,
    };

    next();
  });
};
