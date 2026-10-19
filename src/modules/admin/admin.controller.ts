import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { authService } from "../auth/auth.service";

const getAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await adminService.getAllUser();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Users fetched successfully.",
      data: users,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, role } = req.body;
    if (!status && !role) {
      throw new Error("status or role are required");
    }
    if (role) {
      if (role !== "ADMIN" && role !== "CUSTOMER" && role !== "PROVIDER") {
        throw new Error(
          "Invalid role. Allowed roles are ADMIN, CUSTOMER, or PROVIDER.",
        );
      }
    }
    // console.log(id , status)
    const updatedUser = await adminService.updateUserStatus(
      id as string,
      status,
      role,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `User status updated to ${status}.`,
      data: updatedUser,
    });
  },
);

export const adminController = {
  getAllUser,
  updateUserStatus,
};
