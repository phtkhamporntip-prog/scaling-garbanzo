import { Prisma, Withdraw } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";

// Withdraw money from wallet and update wallet and user
const withdrawMoney = async (payload:Withdraw) => {
    const { userId, amount } = payload;
   const withdrawResult = await prisma.$transaction( async (transactionClient)=> {
        const isExistUser = await transactionClient.user.findFirst({
            where: {
                id: userId
            }
        });
        if (!isExistUser) {
            throw new ApiError( httpStatus.NOT_FOUND, "User not found to withdraw money");
        }
        if (isExistUser.wallet < amount) {
            throw new ApiError( httpStatus.BAD_REQUEST, "Not enough money to withdraw");
        };
        await transactionClient.user.update({
            where: {
                id: isExistUser.id
            },
            data: {
                wallet: {
                    decrement: amount
                },
                withdraw: {
                    increment: amount
                }
            }
        });

        await transactionClient.wallet.update({
            where: {
                userId: isExistUser.id
            } as Prisma.WalletWhereUniqueInput,
            data: {
                balance: {
                    decrement: amount
                },
                withdraw: {
                    increment: amount
                }
            }
        });
        return transactionClient.withdraw.create({
            data: {
                userId: userId,
                amount: amount
            },
            include: {
                users: true
            }
        });
    });
    return withdrawResult;
};

// get all withdraws data
const getAllWithdraws = async ():Promise<Withdraw[]>=> {
    const withdraws = await prisma.withdraw.findMany({
        include: {
            users: true
        }
    });
    return withdraws;
};

// get withdraw data by id
const getWithdrawById = async (payload:string):Promise<Withdraw[]>=> {
    const withdraw = await prisma.withdraw.findMany({
        where: {
            userId: payload
        },
        include: {
            users: true
        }
    });
    return withdraw;
};

export const WithdrawsService = {
    withdrawMoney,
    getAllWithdraws,
    getWithdrawById
};
