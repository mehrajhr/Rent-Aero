import { OrderStatus } from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { ICreateReview, IUpdateReviewPayload } from "./review.interface";

const createReview = async (payload: ICreateReview) => {
  const { userId, gearId, orderId, comment, rating } = payload;

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Rental order not found.");
  }

  if (order.customerId !== userId) {
    throw new Error("You are not authorized to review this order.");
  }

  if (order.status !== OrderStatus.RETURNED) {
    throw new Error(
      "You can only review a gear after the rental order is marked as 'RETURNED'.",
    );
  }

  const isGearInOrder = order.items.some((item) => item.gearId === gearId);
  if (!isGearInOrder) {
    throw new Error("This gear item was not part of your rental order.");
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      orderId,
      gearId,
    },
  });

  if (existingReview) {
    throw new Error(
      "You have already submitted a review for this gear in this order.",
    );
  }

  const review = await prisma.review.create({
    data: {
      userId,
      orderId,
      gearId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return review;
};

const updateReview = async (payload: IUpdateReviewPayload) => {
  const { reviewId, userId, rating, comment } = payload;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found.");
  }

  if (review.userId !== userId) {
    throw new Error("You do not have permission to update this review.");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedReview;
};

export const reviewService = {
  createReview,
  updateReview,
};
