
import express from 'express';
import { StakesController } from './stakes.controller';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';

const router = express.Router();
router.get(
    '/', 
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    StakesController.getAllStakes
);
router.get(
    '/:id',
    AuthPermission(
        ENUM_USER_ROLE.ADMIN, 
        ENUM_USER_ROLE.STAKER, 
        ENUM_USER_ROLE.INVESTOR
    ),
    StakesController.getStakeById
);
router.post(
    '/startStaking', 
    AuthPermission(
        ENUM_USER_ROLE.ADMIN, 
        ENUM_USER_ROLE.STAKER, 
        ENUM_USER_ROLE.INVESTOR
    ),
    StakesController.startStaking
);

export const stakesRoutes = router;
