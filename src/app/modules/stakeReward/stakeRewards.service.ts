import prisma from "../../../shared/prisma";

const getStakeRewardsDaily = async () => {
    // if stake.amount >= 50 user will get 5% daily. this reward will be added to StakeReward table daily at 00:00:00
    const eligibleStakes = await prisma.stake.findMany({
        where: {
            amount: {
                gte: 50,
            },
        },
    });
    const stakeRewards = eligibleStakes.map((stake) => {
        return {
            userId: stake.userId,
            amount: stake.amount * 0.05,
        };
    });
    const stakeRewardsDaily = await prisma.stakeReward.createMany({
        data: stakeRewards.map((stakeReward) => ({
            userId: stakeReward.userId,
            amount: stakeReward.amount,
        })),
    });
    await Promise.all(stakeRewards.map(async (stakeReward) => {
        await prisma.user.update({
            where: {
                id: stakeReward.userId,
            },
            data: {
                wallet: {
                    increment: stakeReward.amount,
                },
                stakeReward: {
                    increment: stakeReward.amount,
                },
            },
        });
    }));
    return stakeRewardsDaily;
}

const getAllStakeRewards = async () => {                    
    const stakeRewards = await prisma.stakeReward.findMany({
        include: {
            users: true,
        },
    });
    return stakeRewards;
}

const getStakeRewardById = async (id: string) => {
    const stakeReward = await prisma.stakeReward.findUnique({
        where: {
            id,
        },
        include: {
            users: true,
        },
    });
    return stakeReward;
};

export const StakeRewardsService = {
    getStakeRewardsDaily,
    getAllStakeRewards,
    getStakeRewardById,
};
