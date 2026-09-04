import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUser);
router.patch("/users/:id", auth(Role.ADMIN), adminController.updateUserStatus)

export const adminRoutes = router;
