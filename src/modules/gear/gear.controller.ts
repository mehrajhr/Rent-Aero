import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { gearService } from "./gearr.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;
    const gearItem = await gearService.createGear(id as string, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Gear created successfully.",
      data: { gearItem },
    });
  },
);

const updateGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id as string;
    const userId = req.user?.id as string;
    const payLoad = req.body;

    const updatedGear = await gearService.updateGear(id, userId, payLoad);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "This gear updated successfully.",
      data: {
        updatedGear,
      },
    });
  },
);

export const gearController = {
  createGear,
  updateGear,
};
