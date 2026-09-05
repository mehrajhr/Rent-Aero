import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../prisma/generated/prisma/enums";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.patch("/:id", auth(Role.ADMIN), categoryController.updateCategory);

export const categoryRoutes = router;
