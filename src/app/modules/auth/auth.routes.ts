import express from "express";
import ValidateRequest from "../../middleware/validateRequest";
import { authValidation } from "./authZodValidation";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post(
  "/register",
  ValidateRequest(authValidation.signupValidation),
  AuthController.createUser
);
router.post(
  "/login",
  ValidateRequest(authValidation.loginValidation),
  AuthController.loginUser
);

export const authRoutes = router;
