import express from "express";
import ValidateRequest from "../../middleware/validateRequest";
import { authValidation } from "./authZodValidation";
import { AuthController } from "./auth.controller";
import AuthPermission from "../../middleware/authPermission";

const router = express.Router();

router.post(
  "/register",
  ValidateRequest(authValidation.signupValidation),
  AuthController.createUser
);
router.post(
  "/bootstrap-admin",
  ValidateRequest(authValidation.bootstrapAdminValidation),
  AuthController.bootstrapAdmin
);
router.post(
  "/login",
  ValidateRequest(authValidation.loginValidation),
  AuthController.loginUser
);
router.get(
  "/me",
  AuthPermission(),
  AuthController.getCurrentUser
);
router.get(
  "/oauth/providers",
  AuthController.oauthProviders
);
router.get(
  "/oauth/:provider/start",
  ValidateRequest(authValidation.oauthProviderValidation),
  AuthController.oauthStart
);
router.get(
  "/oauth/:provider/callback",
  ValidateRequest(authValidation.oauthCallbackValidation),
  AuthController.oauthCallback
);
router.post(
  "/refresh-token",
  ValidateRequest(authValidation.refreshTokenValidation),
  AuthController.refreshToken
);
router.post(
  "/logout",
  ValidateRequest(authValidation.logoutValidation),
  AuthController.logout
);

export const authRoutes = router;
