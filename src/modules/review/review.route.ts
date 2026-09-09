import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { reviewController } from "./review.controller";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  reviewController.createReview,
);

router.patch(
  "/:id",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  reviewController.updateReview,
);

export const reviewRoutes = router;
