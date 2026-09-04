import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { name, slug } = payload;
    if (!name || !slug) {
      throw new Error("Category name and slug are required fields.");
    }
    const category = await categoryService.createCategory(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: `Category ${name} created successfully`,
      data: {
        category,
      },
    });
  },
);

export const categoryController = {
  createCategory,
};
