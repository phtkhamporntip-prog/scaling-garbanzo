import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || "5000",
  client_url: process.env.CLIENT_URL,
  database_url: process.env.DATABASE_URL,
  salt_rounds: process.env.SALT_ROUNDS,
  app_name: process.env.APP_NAME,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    state_secret: process.env.JWT_STATE_SECRET || process.env.JWT_SECRET,
  },
  cookie: {
    access_token_name: process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken",
    refresh_token_name: process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken",
    domain: process.env.COOKIE_DOMAIN,
    same_site: process.env.COOKIE_SAME_SITE || "lax",
    secure: process.env.COOKIE_SECURE === "true",
  },
  oauth: {
    google: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      callback_url: process.env.GOOGLE_CALLBACK_URL,
      scopes: process.env.GOOGLE_SCOPES || "openid profile email",
    },
    github: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      callback_url: process.env.GITHUB_CALLBACK_URL,
      scopes: process.env.GITHUB_SCOPES || "read:user user:email",
    },
    microsoft: {
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      callback_url: process.env.MICROSOFT_CALLBACK_URL,
      tenant: process.env.MICROSOFT_TENANT || "common",
      scopes:
        process.env.MICROSOFT_SCOPES ||
        "openid profile email offline_access User.Read",
    },
    oidc: {
      client_id: process.env.OIDC_CLIENT_ID,
      client_secret: process.env.OIDC_CLIENT_SECRET,
      callback_url: process.env.OIDC_CALLBACK_URL,
      authorization_url: process.env.OIDC_AUTHORIZATION_URL,
      token_url: process.env.OIDC_TOKEN_URL,
      userinfo_url: process.env.OIDC_USERINFO_URL,
      scopes: process.env.OIDC_SCOPES || "openid profile email",
    },
  },
  security: {
    oauth_state_ttl_minutes: parseNumber(process.env.OAUTH_STATE_TTL_MINUTES, 10),
  },
  admin: {
    bootstrap_secret: process.env.ADMIN_BOOTSTRAP_SECRET,
  },
};

const getMissingKeys = (keys: string[]): string[] => {
  return keys.filter((key) => !process.env[key]);
};

const validateProvider = (
  providerName: string,
  keys: string[],
  activationKeys: string[],
  errors: string[]
): void => {
  const activationCount = activationKeys.filter((key) => Boolean(process.env[key])).length;

  if (activationCount === 0) {
    return;
  }

  const presentCount = keys.filter((key) => Boolean(process.env[key])).length;

  if (presentCount > 0 && presentCount < keys.length) {
    const missing = getMissingKeys(keys);
    errors.push(
      `${providerName}: partially configured. Missing ${missing.join(", ")}`
    );
  }
};

export const validateEnvConfig = (): void => {
  const errors: string[] = [];

  const requiredKeys = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES_IN",
    "JWT_STATE_SECRET",
    "ADMIN_BOOTSTRAP_SECRET",
  ];
  const missingRequired = getMissingKeys(requiredKeys);

  if (missingRequired.length > 0) {
    errors.push(`Missing required environment variables: ${missingRequired.join(", ")}`);
  }

  validateProvider(
    "google",
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"],
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    errors
  );
  validateProvider(
    "github",
    ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "GITHUB_CALLBACK_URL"],
    ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    errors
  );
  validateProvider(
    "microsoft",
    [
      "MICROSOFT_CLIENT_ID",
      "MICROSOFT_CLIENT_SECRET",
      "MICROSOFT_CALLBACK_URL",
    ],
    ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"],
    errors
  );
  validateProvider(
    "oidc",
    [
      "OIDC_CLIENT_ID",
      "OIDC_CLIENT_SECRET",
      "OIDC_CALLBACK_URL",
      "OIDC_AUTHORIZATION_URL",
      "OIDC_TOKEN_URL",
      "OIDC_USERINFO_URL",
    ],
    ["OIDC_CLIENT_ID", "OIDC_CLIENT_SECRET"],
    errors
  );

  const sameSite = (config.cookie.same_site || "lax").toLowerCase();
  if (!["lax", "strict", "none"].includes(sameSite)) {
    errors.push("COOKIE_SAME_SITE must be one of: lax, strict, none");
  }

  if (sameSite === "none" && !config.cookie.secure) {
    errors.push("COOKIE_SECURE must be true when COOKIE_SAME_SITE is none");
  }

  if (Number.isNaN(Number(config.port))) {
    errors.push("PORT must be a valid number");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
  }
};

export default config;
