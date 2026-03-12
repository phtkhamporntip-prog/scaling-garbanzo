import express from "express";
import { ReferralsController } from "./referrals.controller";
import ValidateRequest from "../../middleware/validateRequest";
import { ReferralsValidation } from "./referrals.zod.validation";
import AuthPermission from "../../middleware/authPermission";
import { ENUM_USER_ROLE } from "../../../enums";

const router = express.Router();
router.get(
  "/",
  AuthPermission(ENUM_USER_ROLE.ADMIN),
  ReferralsController.getAllReferrals
);
router.get(
  "/:id",
  AuthPermission(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.STAKER,
    ENUM_USER_ROLE.INVESTOR
  ),
  ReferralsController.getReferralById
);
router.post(
  "/createReferral",
  AuthPermission(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.STAKER),
  ValidateRequest(ReferralsValidation.postValidation),
  ReferralsController.createReferral
);

export const referralsRoutes = router;
