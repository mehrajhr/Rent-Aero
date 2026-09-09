import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { paymentsController } from "./payment.controller";

const router = Router();

router.post(
  "/checkout/:id",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  paymentsController.createCheckoutSession,
);

router.post("/webhook", paymentsController.handleWebHook);

router.get(
  "/",
  auth(Role.ADMIN, Role.CUSTOMER, Role.CUSTOMER),
  paymentsController.getPaymentHistory,
);
router.get(
  "/:id",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  paymentsController.getPaymentDetails,
);

export const paymentsRoute = router;
