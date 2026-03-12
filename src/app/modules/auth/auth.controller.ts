import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { AuthServices } from "./auth.services";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { authCookieHelpers } from "./auth.cookies";
import { TProviderName } from "./auth.interfaces";
import config from "../../../config";

// Create user in database
const createUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthServices.createUser(payload);
    if (!result){
        throw new ApiError( httpStatus.BAD_REQUEST, "User didn't create");
    }

    sendResponse( res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully",
        data: result,
    });
});

const bootstrapAdmin = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthServices.bootstrapAdmin(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Admin user bootstrapped successfully",
        data: result,
    });
});

// Login user
const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthServices.loginUser(payload, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
    });
    if (!result){
        throw new ApiError( httpStatus.BAD_REQUEST, "User didn't login");
    }

    authCookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse( res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User login successfully",
        token: result.accessToken,
        data: {
            user: result.user,
        },
    });
});

    const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
        if (!req.user?.id) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
        }

        const result = await AuthServices.getCurrentUser(String(req.user.id));

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Current user fetched successfully",
            data: result,
        });
    });

const oauthStart = catchAsync(async (req: Request, res: Response) => {
    const provider = req.params.provider as TProviderName;
    const result = await AuthServices.getAuthorizationUrl(provider);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `OAuth URL generated for ${provider}`,
        data: result,
    });
});

const oauthProviders = catchAsync(async (req: Request, res: Response) => {
    const result = AuthServices.getOAuthProviderStatus();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "OAuth provider status fetched successfully",
        data: result,
    });
});

const oauthCallback = catchAsync(async (req: Request, res: Response) => {
    const provider = req.params.provider as TProviderName;
    const { code, state } = req.query as { code: string; state: string };

    const result = await AuthServices.completeOAuthLogin(provider, code, state, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
    });

    authCookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `OAuth login successful for ${provider}`,
        token: result.accessToken,
        data: {
            user: result.user,
        },
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshTokenFromCookie = req.cookies?.[config.cookie.refresh_token_name];
    const refreshTokenFromBody = req.body?.refreshToken;
    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

    if (!refreshToken) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Refresh token is required");
    }

    const result = await AuthServices.refreshToken(refreshToken, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
    });

    authCookieHelpers.setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Token refreshed successfully",
        token: result.accessToken,
        data: {
            user: result.user,
        },
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    const refreshTokenFromCookie = req.cookies?.[config.cookie.refresh_token_name];
    const refreshTokenFromBody = req.body?.refreshToken;
    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;

    await AuthServices.logout(refreshToken);
    authCookieHelpers.clearAuthCookies(res);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logout successfully",
    });
});

export const AuthController = {
    createUser,
    bootstrapAdmin,
    loginUser,
    getCurrentUser,
    oauthProviders,
    oauthStart,
    oauthCallback,
    refreshToken,
    logout,
};
