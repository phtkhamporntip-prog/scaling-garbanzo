import { User } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";
import { hashPasswordHelper } from "../../../utils/hashPassword";
import config from "../../../config";
import { TLoginPayload } from "./auth.interfaces";
import { jwtHelpers } from "../../../utils/jwtHelpers";

const createUser = async (payload: User) => {
    // Check if user already exist
  const isExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  
  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User already exist with this email"
    );
  }
  // Hash password
  payload.password = await hashPasswordHelper.hashPassword(payload.password);
    // Create user
  const user = await prisma.user.create({
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      contactNo: true,
      img: true,
      wallet: true,
    },
  });
  return user;
};

const loginUser = async (payload: TLoginPayload) => {
    // Check if user exist
    const user = await prisma.user.findFirst({
        where: {
            email: payload?.email,
        },
    });
    // If user not exist throw error
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    // Compare password
    const isMatch = await hashPasswordHelper.comparePassword(payload.password, user.password);
    // If password not match throw error
    if (!isMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    // Generate token
    const token = await jwtHelpers.createToken(
        {
            id: user.id,
            role: user.role,
        },
        config.jwt.secret as string,
        config.jwt.expires_in as string
    );
    // Return token
    return token;
};

export const AuthServices = {
    createUser,
    loginUser,
};
