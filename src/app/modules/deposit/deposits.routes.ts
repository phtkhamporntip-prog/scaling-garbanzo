
import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { DepositsController } from './deposits.controller';
import ValidateRequest from '../../middleware/validateRequest';
import { DepositsValidation } from './deposits.zod.validation';

const router = express.Router();

router.get('/', 
    AuthPermission(ENUM_USER_ROLE.ADMIN),
    DepositsController.getAllDeposits
);

router.get('/:id', 
    AuthPermission(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.INVESTOR, ENUM_USER_ROLE.STAKER, ENUM_USER_ROLE.ADMIN),
    DepositsController.getDepositById
);

router.post('/createDeposit', 
    AuthPermission(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    ValidateRequest(DepositsValidation.postValidation),
    DepositsController.postDepositMoney
);

export const depositsRoutes = router;
