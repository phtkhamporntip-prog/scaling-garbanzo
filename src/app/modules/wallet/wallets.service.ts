import httpStatus from "http-status";
import ApiError from "../../../error/apiError";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../utils/jwtHelpers";
import config from "../../../config";
import { Wallet } from "@prisma/client";

const getAllWallets = async (): Promise<Wallet[]> => {
    const result = await prisma.wallet.findMany({});

    if (result.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Wallets data not found");
    };

    return result;
}

const getWalletById = async ( token:string, id: string) => {
    
    const decodeToken = jwtHelpers.verifyToken(token, config.jwt.secret!);
    const userId = decodeToken.id;
    const isValidUser = await prisma.wallet.findFirst({
        where: {
            userId: userId,
        },
    });

    if (!isValidUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid user");
    };

    const result = await prisma.wallet.findUnique({
      where: {
        id: id,
      },
      include: {
        users: true,
      },
    });

    if (!result) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Wallet data not found");
    };

    return result;
}

export const WalletsService = {
    getAllWallets,
    getWalletById,
};
