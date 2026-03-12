import { Prisma, Referral } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";
import { ENUM_USER_ROLE } from "../../../enums";

const createReferral = async (payload:Referral) => {
  const { userId, referredBy, referralDeposit } = payload;
  // check if user deposit is greater than referral deposit
  const isEligibleForReferral = await prisma.deposit.findFirst({
    where: {
      userId: userId,
      amount: {
        gte: referralDeposit,
      },
    },
  });
  if (!isEligibleForReferral) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not eligible for referral");
  };
  // check if user exists
  const isExistingUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
  // check if referredBy user exists
  const isExistingReferralUser = await prisma.user.findFirst({
    where: {
      id: referredBy,
    },
  });
  // handle error if user does not exist
  if (!isExistingUser && !isExistingReferralUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  };
  // check if user has been referred before, if yes, throw error
  const isExistingReferral = await prisma.referral.findFirst({
    where: {
      userId: userId,
    },
  });
  if (isExistingReferral) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User has been referred before");
  };
  const referralWorks = await prisma.$transaction(async transactionClient => {
    // create referral income
    const referralIncomeData =  await transactionClient.referralIncome.create({
        data: {
          userId: referredBy,
          amount: referralDeposit * 0.05,
          referredTo: userId,
        },
      });

    // update user
    await transactionClient.user.update({
      where: {
        id: userId,
      },
      data: {
        deposit: {
          decrement: referralDeposit - referralDeposit * 0.05,
        },
        wallet: {
          decrement: referralDeposit - referralDeposit * 0.05,
        },
        stake: {
          increment: referralDeposit - referralDeposit * 0.05,
        },
        role: ENUM_USER_ROLE.INVESTOR,
      },
    });

    // update or create stake
    const isExistingStake = await transactionClient.stake.findFirst({
      where: {
        userId: userId,
      },
    });
    let stakeData;
    if (isExistingStake) {
      stakeData = await transactionClient.stake.update({
        where: {
          id: isExistingStake.id,
        },
        data: {
          amount: {
            increment: referralDeposit - referralDeposit * 0.05,
          },
        },
      });
    } else {
      stakeData = await transactionClient.stake.create({
        data: {
          userId: userId,
          amount: referralDeposit - referralDeposit * 0.05,
        },
      });
    }

    // update referred user wallet
    await transactionClient.user.update({
      where: {
        id: referredBy,
      },
      data: {
        wallet: {
          increment: referralDeposit * 0.05,
        },
        referralReward: {
          increment: referralDeposit * 0.05,
        },
        income: {
          increment: referralDeposit * 0.05,
        },
      },
    });
    // update or create income
    const isExistingIncome = await transactionClient.incomes.findFirst({
      where: {
        userId: referredBy,
      },
    });
    if (isExistingIncome) {
      await transactionClient.incomes.update({
        where: {
          id: isExistingIncome.id,
        },
        data: {
          totalIncome: {
            increment: referralDeposit * 0.05,
          },
          referralIncome: {
            increment: referralDeposit * 0.05,
          },
        },
      });
    }
    
    await transactionClient.incomes.create({
      data: {
        userId: referredBy,
        totalIncome: referralDeposit * 0.05,
        referralIncome: referralDeposit * 0.05,
        referralIncomeId: referralIncomeData.id,
        stakeRewardsId: stakeData.id,
      } as Prisma.IncomesUncheckedCreateInput,
    });
    // update or create wallet
    const isExistingWallet = await transactionClient.wallet.findFirst({
      where: {
        userId: referredBy,
      },
    });
    if (isExistingWallet) {
      await transactionClient.wallet.update({
        where: {
          id: isExistingWallet.id,
        },
        data: {
          referralReward: {
            increment: referralDeposit * 0.05,
          },
          balance: {
            increment: referralDeposit * 0.05,
          },
        },
      });
    }
    await transactionClient.wallet.create({
      data: {
        userId: referredBy,
        referralReward: referralDeposit * 0.05,
        balance: referralDeposit * 0.05,
      },
    });
    // create referral
    const referral = await transactionClient.referral.create({
      data: {
        userId: userId,
        referredBy: referredBy,
        referralDeposit: referralDeposit,
      },
    });
    return referral;
  }
  );
  return referralWorks;
}

// get all referrals
const getAllReferrals = async () => {
  const referrals = await prisma.referral.findMany({
    include: {
      users: true,
      referredByUser: true,
    },
  });
  return referrals;
};

// get referral by id
const getReferralById = async (paramId:string, user:any) => {
// check if user is not admin and not the owner of the referral
if (
    user.role !== ENUM_USER_ROLE.ADMIN &&
    user.id !== paramId
  ) {
      throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized to view this referral"
        );
      }
  const referral = await prisma.referral.findMany({
    where: {
      id: paramId,
    },
    include: {
      referredByUser: true,
      users: true,
    },
  });
  return referral;
};

export const ReferralsService = {
    createReferral,
    getAllReferrals,
    getReferralById,
};
