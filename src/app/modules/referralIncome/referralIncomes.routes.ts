
import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { ReferralIncomesController } from './referralIncomes.controller';

const router = express.Router();
router.get(
    '/all',
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    ReferralIncomesController.getReferralIncomes
) 
router.get(
  "/:id",
  AuthPermission(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.STAKER,
    ENUM_USER_ROLE.INVESTOR
  ),
  ReferralIncomesController.getReferralIncomeById
); 

export const referralIncomesRoutes = router;
