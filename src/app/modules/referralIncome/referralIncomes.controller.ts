import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReferralIncomesService } from "./referralIncomes.service";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";

const getReferralIncomes = catchAsync(async (req: Request, res: Response) => {
  const result = await ReferralIncomesService.getReferralIncomes();
  if (result.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No referral incomes found");
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Referral incomes fetched successfully",
    data: result
  });
})

const getReferralIncomeById = catchAsync(async (req: Request, res: Response) => {
    const payload = req.params.id;
    const result = await ReferralIncomesService.getReferralIncomeById(payload);
    if (!result) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No referral income found");
    };
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Referral income fetched successfully",
        data: result
    });
})

export const ReferralIncomesController = {
    getReferralIncomes,
    getReferralIncomeById
};
