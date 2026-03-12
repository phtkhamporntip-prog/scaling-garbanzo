import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../error/apiError";
import { jwtHelpers } from "../../utils/jwtHelpers";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null;
    }
  }
}

const AuthPermission =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req.headers.authorization;
      const bearerToken = authorizationHeader?.startsWith("Bearer ")
        ? authorizationHeader.split(" ")[1]
        : authorizationHeader;
      const cookieToken = req.cookies?.[config.cookie.access_token_name];
      const token = bearerToken || cookieToken;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }
      // verify token
      let verifiedUser = null;
      verifiedUser = jwtHelpers.verifyToken(token, config.jwt.secret as Secret);
      // set user to req.user
      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default AuthPermission;
