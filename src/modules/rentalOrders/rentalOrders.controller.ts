import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalOrdersService } from "./rentalOrders.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { OrderStatus, Role } from "../../../prisma/generated/prisma/enums";

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

const getMyRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cutomerId = req.user?.id as string;

    const rentals = await rentalOrdersService.getMyRentals(cutomerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rentals fetched successfully",
      data: rentals,
    });
  },
);

const getProviderIncomingOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const orders =
      await rentalOrdersService.getProviderRentalOrders(providerId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Orders fetched successfully",
      data: orders,
    });
  },
);

const getAllRentalOrdersForAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await rentalOrdersService.getAllRentalOrdersForAdmin();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Rentals and Orders fetched successfully",
      data: orders,
    });
  },
);

const updateOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params?.id;
    const userId = req.user?.id;
    const { status } = req.body;

    if (!status) {
      throw new Error("Status is required.");
    }

    if (!Object.values(OrderStatus).includes(status)) {
      throw new Error("Invalid order status provided.");
    }

    const updatedOrder = await rentalOrdersService.updateOrderStatus(
      orderId as string,
      userId as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Order status successfully updated to ${status}`,
      data: updatedOrder,
    });
  },
);

const getRentalOrderDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: orderId } = req.params;
    const userId = req.user?.id as string;
    const userRole = req.user?.role;

    const order = await rentalOrdersService.rentalOrderDetails(
      orderId as string,
      userId,
      userRole as Role,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Order details fetched successfully.",
      data: order,
    });
  },
);

export const rentalOrdersController = {
  createRentalOrder,
  getMyRentals,
  getProviderIncomingOrders,
  getAllRentalOrdersForAdmin,
  updateOrderStatus,
  getRentalOrderDetails,
};
