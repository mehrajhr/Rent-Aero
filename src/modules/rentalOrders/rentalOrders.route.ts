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

router.get(
  "/my-rentals",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  rentalOrdersController.getMyRentals,
);

router.get(
  "/provider-orders",
  auth(Role.PROVIDER),
  rentalOrdersController.getProviderIncomingOrders,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  rentalOrdersController.getRentalOrderDetails,
);

router.get(
  "/all-rentals-orders",
  auth(Role.ADMIN),
  rentalOrdersController.getAllRentalOrdersForAdmin,
);

router.patch(
  "/:id/status",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  rentalOrdersController.updateOrderStatus,
);

export const rentalOrdersRoutes = router;
