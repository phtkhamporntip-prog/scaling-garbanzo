import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { referralsRoutes } from '../modules/referral/referrals.routes';
import { referralIncomesRoutes } from '../modules/referralIncome/referralIncomes.routes';
import { walletsRoutes } from '../modules/wallet/wallets.routes';
import { depositsRoutes } from '../modules/deposit/deposits.routes';
import { withdrawsRoutes } from '../modules/withdraw/withdraws.routes';
import { stakesRoutes } from '../modules/stake/stakes.routes';
import { stakeRewardsRoutes } from '../modules/stakeReward/stakeRewards.routes';
import { incomesRoutes } from '../modules/income/incomes.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/referrals",
    route: referralsRoutes,
  },
  {
    path: "/referral-incomes",
    route: referralIncomesRoutes,
  },
  {
    path: "/wallets",
    route: walletsRoutes,
  },
  {
    path: "/deposits",
    route: depositsRoutes,
  },
  {
    path: "/withdrawals",
    route: withdrawsRoutes,
  },
  {
    path: "/incomes",
    route: incomesRoutes,
  },
  {
    path: "/stakers",
    route: stakesRoutes,
  },
  {
    path: "/stake-rewards",
    route: stakeRewardsRoutes,
  },
];

moduleRoutes.forEach((route) => { 
    router.use(route.path, route.route);
});

export default router;
