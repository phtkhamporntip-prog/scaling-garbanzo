import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StakesService } from "./stakes.service";

const startStaking = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const token = req.headers.authorization
    const tok = await StakesService.startStaking(payload, token as string);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Staking started successfully",
        data: tok,
    });
});

// get all stakes
const getAllStakes = catchAsync(async (req: Request, res: Response) => {
    const stakes = await StakesService.getAllStakes();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Stakes fetched successfully",
        data: stakes,
    });
});

// get stake by id
const getStakeById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const stake = await StakesService.getStakeById(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Stake fetched successfully",
        data: stake,
    });
});

export const StakesController = {
    startStaking,
    getAllStakes,
    getStakeById,
};
