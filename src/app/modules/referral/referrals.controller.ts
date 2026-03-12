import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { ReferralsService } from "./referrals.service";

const createReferral = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await ReferralsService.createReferral(payload);
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User didn't create");
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Referral created and please sign out and sign in again",
    data: result,
  });
});

// getAllReferrals Controller
const getAllReferrals = catchAsync(async (req: Request, res: Response) => {
  const referrals = await ReferralsService.getAllReferrals();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Referrals fetched successfully",
    data: referrals,
  });
});

// getReferralById Controller
const getReferralById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const referral = await ReferralsService.getReferralById(id, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Referral fetched successfully",
    data: referral,
  });
});

export const ReferralsController = {
    createReferral,
    getAllReferrals,
    getReferralById,
};
