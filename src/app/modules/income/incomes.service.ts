import { Incomes, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";

const getAllIncomeData = async ():Promise<Incomes[]> => {
    const result = await prisma.incomes.findMany({
        include: {
            users: true,
        },
    });

    if (result.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, "No income data found")
    }

    return result;
};

const getIncomeDataById = async (payload: string):Promise<Incomes> => {
    const result = await prisma.incomes.findUnique({
        where: {
            id: payload,
        },
        include: {
            users: true,
        },
    });

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "No income data found")
    }

    return result;
};

const updateIncomeData = async (payload: string, data: Incomes):Promise<Incomes> => {
    const isExist = await prisma.incomes.findUnique({
        where: {
            id: payload,
        },
    });
    if (!isExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "No income data found to update")
    }
    const result = await prisma.$transaction( async (prismaClient) => {
        await prismaClient.wallet.update({
            where: {
                userId: isExist.userId,
            } as Prisma.WalletWhereUniqueInput,
            data: {
                balance: {
                    increment: data.stakeIncome + data.referralIncome,
                },
                stakeReward: {
                    increment: data.stakeIncome,
                },
                referralReward: {
                    increment: data.referralIncome,
                },
            },
        });
        const updateIncome = await prismaClient.incomes.update({
            where: {
                id: payload,
            },
            data: {
                totalIncome: {
                    increment: data.stakeIncome + data.referralIncome,
                },
                stakeIncome: {
                    increment: data.stakeIncome,
                },
                referralIncome: {
                    increment: data.referralIncome,
                }
            },
        });
        return updateIncome;
    })

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, "Income data not updated")
    }

    return result;
}

export const IncomesService = {
    getAllIncomeData,
    getIncomeDataById,
    updateIncomeData,
};
