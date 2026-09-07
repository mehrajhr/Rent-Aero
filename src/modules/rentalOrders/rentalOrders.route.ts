import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { rentalOrdersController } from "./rentalOrders.controller";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  rentalOrdersController.createRentalOrder,
);

export const rentalOrdersRoutes = router;
