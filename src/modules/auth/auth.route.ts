import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  authController.getUser,
);
router.patch(
  "/me/update",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  authController.updateUser,
);

export const authRoutes = router;
