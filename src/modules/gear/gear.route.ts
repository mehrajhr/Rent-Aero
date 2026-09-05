import { Router } from "express";
import { gearController } from "./gear.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";
import { authController } from "../auth/auth.controller";

const router = Router();

router.post("/", auth(Role.PROVIDER), gearController.createGear);
router.put("/:id", auth(Role.PROVIDER), gearController.updateGear);

export const gearRoutes = router;
