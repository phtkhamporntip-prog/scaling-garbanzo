import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { IncomesService } from "./incomes.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

const getAllIncomeData = catchAsync(async (req: Request, res: Response) => {
    const result = await IncomesService.getAllIncomeData();
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Income data fetched successfully",
        data: result,
    })
});

const getIncomeDataById = catchAsync(async (req: Request, res: Response) => {
    const payload = req.params.id;
    const result = await IncomesService.getIncomeDataById(payload);
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Income data fetched successfully",
        data: result,
    })
});

const updateIncomeData = catchAsync(async (req: Request, res: Response) => {
    const payload = req.params.id;
    const data = req.body;
    const result = await IncomesService.updateIncomeData(payload, data);
    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Income data updated successfully",
        data: result,
    })
});

export const incomesController = {
    getAllIncomeData,
    getIncomeDataById,
    updateIncomeData,
};
