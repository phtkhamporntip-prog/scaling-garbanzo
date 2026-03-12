import express from 'express';
import AuthPermission from '../../middleware/authPermission';
import { ENUM_USER_ROLE } from '../../../enums';
import { UserControllers } from './user.controller';
import ValidateRequest from '../../middleware/validateRequest';
import { userValidation } from './userZodValidation';

const router = express.Router();

router.get('/',
AuthPermission(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.STAKER, ENUM_USER_ROLE.INVESTOR),
UserControllers.getAllUsers);

router.get('/:id',
AuthPermission(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.STAKER, ENUM_USER_ROLE.INVESTOR),
UserControllers.getUserById);

router.patch('/:id',
AuthPermission(ENUM_USER_ROLE.ADMIN),
ValidateRequest(userValidation.updateValidation),
UserControllers.updateUserById);

router.delete('/:id',
AuthPermission(ENUM_USER_ROLE.ADMIN),
UserControllers.deleteUserById);

export const userRoutes = router;
