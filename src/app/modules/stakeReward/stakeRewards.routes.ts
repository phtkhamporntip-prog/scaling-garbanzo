import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { StakeRewardsController } from './stakeRewards.controller';

const router = express.Router();
router.get('/stakeRewards', 
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    StakeRewardsController.getStakeRewards
);
router.get('/all', 
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    StakeRewardsController.getAllStakeRewards
);
router.get('/:id', 
    AuthPermission(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.INVESTOR, ENUM_USER_ROLE.STAKER),
    StakeRewardsController.getStakeRewardById
);

export const stakeRewardsRoutes = router;
