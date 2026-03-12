import httpStatus from "http-status";
import ApiError from "../../../error/apiError";
import prisma from "../../../shared/prisma";
import { TDepositPayload } from "./deposits.interfaces";

const postDepositMoney = async (payload: TDepositPayload) => {
  const isExist = await prisma.deposit.findFirst({
    where: {
      userId: payload?.userId,
    },
  });
  const isWalletExist = await prisma.wallet.findFirst({
    where: {
      userId: payload?.userId,
    },
  });
  const userDeposit = await prisma.$transaction(async (transactionClient) => {
    if (!isExist && !isWalletExist) {
      await transactionClient.wallet.create({
        data: {
          userId: payload?.userId,
          deposit: payload?.amount,
          balance: payload?.amount,
        },
      });
    }
    await transactionClient.wallet.update({
      where: {
        id: isWalletExist?.id,
      },
      data: {
        deposit: {
          increment: payload?.amount,
        },
        balance: {
          increment: payload?.amount,
        },
      },
    });
    await transactionClient.user.update({
      where: {
        id: payload?.userId,
      },
      data: {
        wallet: {
          increment: payload?.amount,
        },
        deposit: {
          increment: payload?.amount,
        },
      },
    });
    
    const isExistUser = await transactionClient.deposit.findFirst({
      where: {
        userId: payload?.userId,
      },
    });
    if (!isExistUser) {
      return await transactionClient.deposit.create({
        data: {
          userId: payload?.userId,
          amount: payload?.amount,
        },
        include: {
          users: true,
        },
      });
    }

    return await transactionClient.deposit.update({
      where: {
        id: isExistUser?.id,
      },
      data: {
        amount: {
          increment: payload?.amount,
        },
      },
      include: {
        users: true,
      },
    });
  });
  return userDeposit;
};

const getDepositById = async (id: string) => {
  const deposit = await prisma.deposit.findUnique({
    where: {
      id,
    },
    include: {
      users: true,
    },
  });
  return deposit;
};

const getAllDeposits = async () => {
  const deposits = await prisma.deposit.findMany({
    include: {
      users: true,
    },
  });
  if (deposits.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No deposits found");
  }
  return deposits;
};

export const DepositsService = {
  postDepositMoney,
  getDepositById,
  getAllDeposits,
};
