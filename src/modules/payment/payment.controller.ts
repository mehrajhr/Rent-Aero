import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params?.id;
    const customerId = req.user?.id;

    const { checkoutUrl } = await paymentService.createCheckoutSession(
      orderId as string,
      customerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Stripe checkout session created successfully",
      data: {
        checkoutUrl,
      },
    });
  },
);

const handleWebHook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    const result = await paymentService.handleWebhook(signature, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment successfull",
      data: result,
    });
  },
);

const getPaymentHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;

    const result = await paymentService.getPaymentHistory(customerId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history fetched successfully",
      data: result,
    });
  },
);

const getPaymentDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const paymentId = req.params?.id;

    const result = await paymentService.getPaymentDetails(
      paymentId as string,
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment details fetched successfully.",
      data: {
        payment: result,
      },
    });
  },
);

export const paymentsController = {
  createCheckoutSession,
  handleWebHook,
  getPaymentHistory,
  getPaymentDetails,
};
