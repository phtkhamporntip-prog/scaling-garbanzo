import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { WalletsService } from "./wallets.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
    const data = await WalletsService.getAllWallets(); 
    
    sendResponse( res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallets data fetched successfully",
        data: data,
    });
});

const getWalletById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const token = req.headers.authorization;
    const data = await WalletsService.getWalletById( token as string, id ); 
    
    sendResponse( res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet data fetched successfully",
        data: data,
    });
});

export const WalletsController = {
    getAllWallets,
    getWalletById,
};
