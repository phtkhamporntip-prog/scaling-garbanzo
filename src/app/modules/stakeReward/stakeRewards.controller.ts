import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { StakeRewardsService } from "./stakeRewards.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const getStakeRewards = catchAsync(async (req: Request, res: Response) => {
  const stakeRewards = await StakeRewardsService.getStakeRewardsDaily();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stake rewards added successfully",
    data: stakeRewards,
  });
});

const getAllStakeRewards = catchAsync(async (req: Request, res: Response) => {
  const stakeRewards = await StakeRewardsService.getAllStakeRewards();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stake rewards added successfully",
    data: stakeRewards,
  });
});

const getStakeRewardById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stakeReward = await StakeRewardsService.getStakeRewardById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stake rewards added successfully",
    data: stakeReward,
  });
});

export const StakeRewardsController = {
  getStakeRewards,
  getAllStakeRewards,
  getStakeRewardById,
};
