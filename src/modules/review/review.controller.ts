import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const { gearId, orderId, comment, rating } = req.body;

    const review = await reviewService.createReview({
      userId,
      gearId,
      orderId,
      comment,
      rating: Number(rating),
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Review created successfully.",
      data: review,
    });
  },
);

export const reviewController = {
  createReview,
};
