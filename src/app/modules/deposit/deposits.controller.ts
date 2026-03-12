import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DepositsService } from "./deposits.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// post deposit money
const postDepositMoney = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const deposit = await DepositsService.postDepositMoney(payload);
     sendResponse( res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Your deposit has been successfully created",
        data: deposit,
     });
});

// get deposit by id
const getDepositById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deposit = await DepositsService.getDepositById(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Deposit fetched successfully",
        data: deposit,
    });
});

// get all deposits
const getAllDeposits = catchAsync(async (req: Request, res: Response) => {
    const deposits = await DepositsService.getAllDeposits();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Deposits fetched successfully",
        data: deposits,
    });
});

export const DepositsController = {
    postDepositMoney,
    getDepositById,
    getAllDeposits,
};
