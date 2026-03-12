import { CookieOptions, Response } from "express";
import config from "../../../config";

type TSameSite = "lax" | "strict" | "none";

const getSameSite = (): TSameSite => {
  const sameSite = (config.cookie.same_site || "lax").toLowerCase();
  if (sameSite === "none" || sameSite === "strict" || sameSite === "lax") {
    return sameSite;
  }
  return "lax";
};

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.cookie.secure,
  sameSite: getSameSite(),
  domain: config.cookie.domain || undefined,
  path: "/",
});

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const cookieOptions = getCookieOptions();

  res.cookie(config.cookie.access_token_name, accessToken, cookieOptions);
  res.cookie(config.cookie.refresh_token_name, refreshToken, cookieOptions);
};

const clearAuthCookies = (res: Response): void => {
  const cookieOptions = getCookieOptions();

  res.clearCookie(config.cookie.access_token_name, cookieOptions);
  res.clearCookie(config.cookie.refresh_token_name, cookieOptions);
};

export const authCookieHelpers = {
  setAuthCookies,
  clearAuthCookies,
};
