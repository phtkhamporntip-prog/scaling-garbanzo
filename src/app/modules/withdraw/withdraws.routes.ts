
import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { WithdrawsController } from './withdraws.controller';
import ValidateRequest from '../../middleware/validateRequest';
import { WithdrawsValidation } from './withdraws.zod.validation';

const router = express.Router();

router.get('/all', 
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    WithdrawsController.getAllWithdraws
)

router.get('/:id',
    AuthPermission(
        ENUM_USER_ROLE.ADMIN,
        ENUM_USER_ROLE.USER, 
        ENUM_USER_ROLE.INVESTOR, 
        ENUM_USER_ROLE.STAKER
    ),
    WithdrawsController.getWithdrawById
)

router.post(
  "/withdraw-money",
  ValidateRequest(WithdrawsValidation.postValidation),
  AuthPermission(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.INVESTOR,
    ENUM_USER_ROLE.STAKER
  ),
  WithdrawsController.withdrawMoney
);

export const withdrawsRoutes = router;
