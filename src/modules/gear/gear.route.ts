import { Router } from "express";
import { gearController } from "./gear.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/", auth(Role.PROVIDER), gearController.createGear);
router.put("/:id", auth(Role.PROVIDER), gearController.updateGear);
router.delete(
  "/:id",
  auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
  gearController.deleteGear,
);

export const gearRoutes = router;
