import { ReferralIncome } from "@prisma/client";
import prisma from "../../../shared/prisma";

const getReferralIncomes = async ():Promise<ReferralIncome[]> => {
    const result = await prisma.referralIncome.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: true
        }
    }); 
    return result;  
}

const getReferralIncomeById = async (payload: string):Promise<ReferralIncome | null> => {
    const result = await prisma.referralIncome.findUnique({
        where: {
            id: payload
        },
        include: {
            user: true
        }
    });
    return result;
}

export const ReferralIncomesService = {
    getReferralIncomes,
    getReferralIncomeById
};
