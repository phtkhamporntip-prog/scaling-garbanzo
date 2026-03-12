
import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { WalletsController } from './wallets.controller';

const router = express.Router();

router.get(
    '/',
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    WalletsController.getAllWallets
);

router.get(
    '/:id',
    AuthPermission(
        ENUM_USER_ROLE.USER,
        ENUM_USER_ROLE.INVESTOR,
        ENUM_USER_ROLE.STAKER
    ),
    WalletsController.getWalletById
);

export const walletsRoutes = router;
