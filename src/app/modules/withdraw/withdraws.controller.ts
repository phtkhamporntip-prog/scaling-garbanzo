import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { WithdrawsService } from "./withdraws.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await WithdrawsService.withdrawMoney(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw money successfully completed",
    data: result,
  });
});

const getAllWithdraws = catchAsync(async (req: Request, res: Response) => {
  const result = await WithdrawsService.getAllWithdraws();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw data fetched successfully",
    data: result,
  });
});
const getWithdrawById = catchAsync(async (req: Request, res: Response) => {
  const payload = req.params.id;
  const result = await WithdrawsService.getWithdrawById(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw data fetched successfully",
    data: result,
  });
});

export const WithdrawsController = {
  withdrawMoney,
  getAllWithdraws,
  getWithdrawById
};
