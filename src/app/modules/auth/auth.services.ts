import prisma from "../../../shared/prisma";
import ApiError from "../../../error/apiError";
import httpStatus from "http-status";
import { hashPasswordHelper } from "../../../utils/hashPassword";
import config from "../../../config";
import {
  TBootstrapAdminPayload,
  TAuthTokens,
  TLoginPayload,
  TOAuthProfile,
  TProviderName,
} from "./auth.interfaces";
import { jwtHelpers } from "../../../utils/jwtHelpers";

type TRole = "user" | "admin" | "investor" | "staker";
type TOAuthProvider = "google" | "github" | "microsoft" | "oidc";
type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  img?: string | null;
  profileImg?: string | null;
  role?: TRole;
  contactNo: string;
  address?: string | null;
};

type TOAuthTokenResponse = {
  access_token: string;
  token_type?: string;
  id_token?: string;
  refresh_token?: string;
};

type TOAuthResult = TAuthTokens & {
  user: {
    id: string;
    name: string;
    email: string;
    role: TRole;
    img: string | null;
  };
};

const getRequiredConfig = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new ApiError(httpStatus.BAD_REQUEST, `${key} is not configured`);
  }
  return value;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const mapProvider = (provider: TProviderName): TOAuthProvider => {
  const providerMap: Record<TProviderName, TOAuthProvider> = {
    google: "google",
    github: "github",
    microsoft: "microsoft",
    oidc: "oidc",
  };

  return providerMap[provider];
};

const getProviderScopes = (provider: TProviderName): string => {
  switch (provider) {
    case "google":
      return config.oauth.google.scopes;
    case "github":
      return config.oauth.github.scopes;
    case "microsoft":
      return config.oauth.microsoft.scopes;
    case "oidc":
      return config.oauth.oidc.scopes;
    default:
      return "openid profile email";
  }
};

const getProviderConfig = (provider: TProviderName) => {
  switch (provider) {
    case "google":
      return {
        clientId: getRequiredConfig(config.oauth.google.client_id, "GOOGLE_CLIENT_ID"),
        clientSecret: getRequiredConfig(
          config.oauth.google.client_secret,
          "GOOGLE_CLIENT_SECRET"
        ),
        callbackUrl: getRequiredConfig(
          config.oauth.google.callback_url,
          "GOOGLE_CALLBACK_URL"
        ),
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
      };
    case "github":
      return {
        clientId: getRequiredConfig(config.oauth.github.client_id, "GITHUB_CLIENT_ID"),
        clientSecret: getRequiredConfig(
          config.oauth.github.client_secret,
          "GITHUB_CLIENT_SECRET"
        ),
        callbackUrl: getRequiredConfig(
          config.oauth.github.callback_url,
          "GITHUB_CALLBACK_URL"
        ),
        authorizationUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
      };
    case "microsoft": {
      const tenant = config.oauth.microsoft.tenant || "common";
      return {
        clientId: getRequiredConfig(
          config.oauth.microsoft.client_id,
          "MICROSOFT_CLIENT_ID"
        ),
        clientSecret: getRequiredConfig(
          config.oauth.microsoft.client_secret,
          "MICROSOFT_CLIENT_SECRET"
        ),
        callbackUrl: getRequiredConfig(
          config.oauth.microsoft.callback_url,
          "MICROSOFT_CALLBACK_URL"
        ),
        authorizationUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
        tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      };
    }
    case "oidc":
      return {
        clientId: getRequiredConfig(config.oauth.oidc.client_id, "OIDC_CLIENT_ID"),
        clientSecret: getRequiredConfig(
          config.oauth.oidc.client_secret,
          "OIDC_CLIENT_SECRET"
        ),
        callbackUrl: getRequiredConfig(
          config.oauth.oidc.callback_url,
          "OIDC_CALLBACK_URL"
        ),
        authorizationUrl: getRequiredConfig(
          config.oauth.oidc.authorization_url,
          "OIDC_AUTHORIZATION_URL"
        ),
        tokenUrl: getRequiredConfig(config.oauth.oidc.token_url, "OIDC_TOKEN_URL"),
      };
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Unsupported OAuth provider");
  }
};

const isProviderConfigured = (provider: TProviderName): boolean => {
  switch (provider) {
    case "google":
      return Boolean(
        config.oauth.google.client_id &&
          config.oauth.google.client_secret &&
          config.oauth.google.callback_url
      );
    case "github":
      return Boolean(
        config.oauth.github.client_id &&
          config.oauth.github.client_secret &&
          config.oauth.github.callback_url
      );
    case "microsoft":
      return Boolean(
        config.oauth.microsoft.client_id &&
          config.oauth.microsoft.client_secret &&
          config.oauth.microsoft.callback_url
      );
    case "oidc":
      return Boolean(
        config.oauth.oidc.client_id &&
          config.oauth.oidc.client_secret &&
          config.oauth.oidc.callback_url &&
          config.oauth.oidc.authorization_url &&
          config.oauth.oidc.token_url &&
          config.oauth.oidc.userinfo_url
      );
    default:
      return false;
  }
};

const ensureProviderConfigured = (provider: TProviderName): void => {
  if (!isProviderConfigured(provider)) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `${provider} OAuth provider is not configured`
    );
  }
};

const getOAuthProviderStatus = () => {
  const providers: TProviderName[] = ["google", "github", "microsoft", "oidc"];
  return providers.map((provider) => ({
    provider,
    configured: isProviderConfigured(provider),
  }));
};

const issueTokens = async (
  userId: string,
  role: TRole,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<TAuthTokens> => {
  const jwtSecret = getRequiredConfig(config.jwt.secret, "JWT_SECRET");
  const accessExpiresIn = getRequiredConfig(config.jwt.expires_in, "JWT_EXPIRES_IN");
  const refreshSecret = getRequiredConfig(
    config.jwt.refresh_secret,
    "JWT_REFRESH_SECRET"
  );
  const refreshExpiresIn = getRequiredConfig(
    config.jwt.refresh_expires_in,
    "JWT_REFRESH_EXPIRES_IN"
  );
  const jti = jwtHelpers.generateTokenId();

  const accessToken = jwtHelpers.createToken(
    { id: userId, role },
    jwtSecret,
    accessExpiresIn
  );

  const refreshToken = jwtHelpers.createToken(
    {
      id: userId,
      role,
      jti,
      type: "refresh",
    },
    refreshSecret,
    refreshExpiresIn
  );

  const refreshPayload = jwtHelpers.decodeToken(refreshToken);
  if (!refreshPayload?.exp) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Unable to issue refresh token");
  }

  await prisma.refreshSession.create({
    data: {
      userId,
      jti,
      tokenHash: jwtHelpers.hashToken(refreshToken),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expiresAt: new Date(refreshPayload.exp * 1000),
    },
  });

  return { accessToken, refreshToken };
};

const exchangeCodeForTokens = async (
  provider: TProviderName,
  code: string
): Promise<TOAuthTokenResponse> => {
  const providerConfig = getProviderConfig(provider);
  const payload = new URLSearchParams();

  payload.set("client_id", providerConfig.clientId);
  payload.set("client_secret", providerConfig.clientSecret);
  payload.set("code", code);
  payload.set("redirect_uri", providerConfig.callbackUrl);
  payload.set("grant_type", "authorization_code");

  const response = await fetch(providerConfig.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: payload,
  });

  if (!response.ok) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to exchange OAuth code");
  }

  const data = (await response.json()) as TOAuthTokenResponse;
  if (!data.access_token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OAuth provider did not return access token");
  }

  return data;
};

const fetchGoogleProfile = async (accessToken: string): Promise<TOAuthProfile> => {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to fetch Google profile");
  }

  const profile = (await response.json()) as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean;
  };

  return {
    providerAccountId: profile.sub,
    email: normalizeEmail(profile.email),
    name: profile.name,
    image: profile.picture,
    emailVerified: profile.email_verified,
  };
};

const fetchGithubProfile = async (accessToken: string): Promise<TOAuthProfile> => {
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "scaling-garbanzo",
    },
  });

  if (!userResponse.ok) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to fetch GitHub profile");
  }

  const user = (await userResponse.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url?: string;
    email?: string | null;
  };

  let email = user.email || "";
  let emailVerified = false;

  if (!email) {
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "scaling-garbanzo",
      },
    });

    if (emailResponse.ok) {
      const emails = (await emailResponse.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((item) => item.primary) || emails[0];
      email = primary?.email || "";
      emailVerified = Boolean(primary?.verified);
    }
  }

  if (!email) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "GitHub account does not expose an email"
    );
  }

  return {
    providerAccountId: String(user.id),
    email: normalizeEmail(email),
    name: user.name || user.login,
    image: user.avatar_url,
    emailVerified,
  };
};

const fetchMicrosoftProfile = async (accessToken: string): Promise<TOAuthProfile> => {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to fetch Microsoft profile");
  }

  const profile = (await response.json()) as {
    id: string;
    displayName?: string;
    mail?: string;
    userPrincipalName?: string;
  };

  const email = profile.mail || profile.userPrincipalName;
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Microsoft account has no email");
  }

  return {
    providerAccountId: profile.id,
    email: normalizeEmail(email),
    name: profile.displayName || email,
    emailVerified: true,
  };
};

const fetchOidcProfile = async (accessToken: string): Promise<TOAuthProfile> => {
  const userInfoUrl = getRequiredConfig(config.oauth.oidc.userinfo_url, "OIDC_USERINFO_URL");
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to fetch OIDC profile");
  }

  const profile = (await response.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    preferred_username?: string;
  };

  const email = profile.email || profile.preferred_username;
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OIDC profile has no email");
  }

  return {
    providerAccountId: profile.sub,
    email: normalizeEmail(email),
    name: profile.name || email,
    image: profile.picture,
    emailVerified: profile.email_verified,
  };
};

const fetchOAuthProfile = async (
  provider: TProviderName,
  accessToken: string
): Promise<TOAuthProfile> => {
  switch (provider) {
    case "google":
      return fetchGoogleProfile(accessToken);
    case "github":
      return fetchGithubProfile(accessToken);
    case "microsoft":
      return fetchMicrosoftProfile(accessToken);
    case "oidc":
      return fetchOidcProfile(accessToken);
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Unsupported OAuth provider");
  }
};

const validateState = (provider: TProviderName, state: string): void => {
  const stateSecret = getRequiredConfig(config.jwt.state_secret, "JWT_STATE_SECRET");
  const decoded = jwtHelpers.verifyToken(state, stateSecret);

  if (decoded.provider !== provider || decoded.type !== "oauth_state") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OAuth state");
  }
};

const createUser = async (payload: TRegisterPayload) => {
  const normalizedEmail = normalizeEmail(payload.email);

  const isExist = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (isExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User already exist with this email"
    );
  }

  const hashedPassword = await hashPasswordHelper.hashPassword(payload.password);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: normalizedEmail,
      password: hashedPassword,
      img: payload.img || payload.profileImg || undefined,
      role: "user",
      contactNo: payload.contactNo,
      address: payload.address,
    },
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

const bootstrapAdmin = async (payload: TBootstrapAdminPayload) => {
  if (!config.admin.bootstrap_secret) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "ADMIN_BOOTSTRAP_SECRET is not configured"
    );
  }

  if (payload.secret !== config.admin.bootstrap_secret) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid admin bootstrap secret");
  }

  const normalizedEmail = normalizeEmail(payload.email);
  const existing = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already exists with this email");
  }

  const hashedPassword = await hashPasswordHelper.hashPassword(payload.password);
  const admin = await prisma.user.create({
    data: {
      name: payload.name,
      email: normalizedEmail,
      password: hashedPassword,
      img: payload.profileImg,
      role: "admin",
      contactNo: payload.contactNo,
      address: payload.address,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      contactNo: true,
      address: true,
      img: true,
      createdAt: true,
    },
  });

  return admin;
};

const loginUser = async (
  payload: TLoginPayload,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<TOAuthResult> => {
  const normalizedEmail = normalizeEmail(payload.email);

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isMatch = await hashPasswordHelper.comparePassword(
    payload.password,
    user.password
  );

  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const tokens = await issueTokens(user.id, user.role, metadata);

  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      img: user.img,
    },
  };
};

const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      img: true,
      contactNo: true,
      address: true,
      wallet: true,
      deposit: true,
      withdraw: true,
      stake: true,
      stakeReward: true,
      referralReward: true,
      income: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const getAuthorizationUrl = async (
  provider: TProviderName
): Promise<{ url: string }> => {
  ensureProviderConfigured(provider);
  const providerConfig = getProviderConfig(provider);
  const stateSecret = getRequiredConfig(config.jwt.state_secret, "JWT_STATE_SECRET");
  const stateTtl = `${config.security.oauth_state_ttl_minutes}m`;
  const state = jwtHelpers.createToken(
    {
      provider,
      type: "oauth_state",
      nonce: jwtHelpers.generateTokenId(),
    },
    stateSecret,
    stateTtl
  );

  const query = new URLSearchParams({
    response_type: "code",
    client_id: providerConfig.clientId,
    redirect_uri: providerConfig.callbackUrl,
    scope: getProviderScopes(provider),
    state,
  });

  if (provider === "google") {
    query.set("access_type", "offline");
    query.set("prompt", "consent");
  }

  return {
    url: `${providerConfig.authorizationUrl}?${query.toString()}`,
  };
};

const completeOAuthLogin = async (
  provider: TProviderName,
  code: string,
  state: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<TOAuthResult> => {
  ensureProviderConfigured(provider);
  validateState(provider, state);
  const tokenResponse = await exchangeCodeForTokens(provider, code);
  const profile = await fetchOAuthProfile(provider, tokenResponse.access_token);

  let user = await prisma.user.findFirst({
    where: {
      email: profile.email,
    },
  });

  const oauthProvider = mapProvider(provider);
  const existingOauthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: oauthProvider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingOauthAccount?.user) {
    user = existingOauthAccount.user;
  }

  if (!existingOauthAccount && user && profile.emailVerified === false) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Cannot auto-link unverified OAuth email"
    );
  }

  if (!user) {
    const randomPassword = await hashPasswordHelper.hashPassword(
      jwtHelpers.generateTokenId()
    );
    user = await prisma.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        password: randomPassword,
        img: profile.image,
        role: "user",
        contactNo: "N/A",
        address: "N/A",
      },
    });
  }

  if (!existingOauthAccount) {
    await prisma.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: oauthProvider,
        providerAccountId: profile.providerAccountId,
        email: profile.email,
      },
    });
  }

  const tokens = await issueTokens(user.id, user.role, metadata);
  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      img: user.img,
    },
  };
};

const refreshToken = async (
  token: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<TOAuthResult> => {
  const refreshSecret = getRequiredConfig(
    config.jwt.refresh_secret,
    "JWT_REFRESH_SECRET"
  );
  const decoded = jwtHelpers.verifyToken(token, refreshSecret);

  if (!decoded?.id || !decoded?.jti || decoded?.type !== "refresh") {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const session = await prisma.refreshSession.findUnique({
    where: {
      jti: String(decoded.jti),
    },
  });

  if (!session || session.userId !== String(decoded.id)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh session not found");
  }

  if (session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token expired");
  }

  if (session.tokenHash !== jwtHelpers.hashToken(token)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token mismatch");
  }

  await prisma.refreshSession.update({
    where: {
      id: session.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: String(decoded.id),
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const tokens = await issueTokens(user.id, user.role, metadata);
  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      img: user.img,
    },
  };
};

const logout = async (token?: string): Promise<void> => {
  if (!token) {
    return;
  }

  try {
    const refreshSecret = getRequiredConfig(
      config.jwt.refresh_secret,
      "JWT_REFRESH_SECRET"
    );
    const decoded = jwtHelpers.verifyToken(token, refreshSecret);

    if (!decoded?.jti) {
      return;
    }

    await prisma.refreshSession.updateMany({
      where: {
        jti: String(decoded.jti),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  } catch {
    // Logout always clears cookies, even for invalid refresh tokens.
  }
};

export const AuthServices = {
  createUser,
  bootstrapAdmin,
  loginUser,
  getCurrentUser,
  getOAuthProviderStatus,
  getAuthorizationUrl,
  completeOAuthLogin,
  refreshToken,
  logout,
};
