import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalOrdersService } from "./rentalOrders.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;

    const result = await rentalOrdersService.createRentalOrders(
      customerId as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message:
        "Rental order placed successfully. Waiting for provider confirmation.",
      data: result,
    });
  },
);

export const rentalOrdersController = {
  createRentalOrder,
};
