import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { incomesController } from './incomes.controller';

const router = express.Router();

router.get(
    '/all', 
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    incomesController.getAllIncomeData
);

router.get(
    '/:id', 
    AuthPermission(
        ENUM_USER_ROLE.ADMIN, 
        ENUM_USER_ROLE.STAKER, 
        ENUM_USER_ROLE.INVESTOR
    ),
    incomesController.getIncomeDataById
);

router.patch(
  "/:id",
  AuthPermission(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.STAKER,
    ENUM_USER_ROLE.INVESTOR
  ),
  incomesController.updateIncomeData
);

export const incomesRoutes = router;
