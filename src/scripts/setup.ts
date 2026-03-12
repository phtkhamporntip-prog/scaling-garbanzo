import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import crypto from "crypto";
import dotenv from "dotenv";

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env");
const envExamplePath = path.join(projectRoot, ".env.example");

const requiredKeys = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
  "JWT_STATE_SECRET",
  "ADMIN_BOOTSTRAP_SECRET",
];

const generatedSecretKeys = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_STATE_SECRET",
  "ADMIN_BOOTSTRAP_SECRET",
];

const looksLikePlaceholder = (value: string | undefined): boolean => {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  const placeholderFragments = [
    "<username>",
    "<password>",
    "<cluster>",
    "your_",
    "replace",
    "example",
    "changeme",
  ];

  return placeholderFragments.some((fragment) => normalized.includes(fragment));
};

const initEnv = (): void => {
  if (fs.existsSync(envPath)) {
    console.log(".env already exists");
    return;
  }

  if (!fs.existsSync(envExamplePath)) {
    throw new Error(".env.example not found");
  }

  fs.copyFileSync(envExamplePath, envPath);
  console.log("Created .env from .env.example");
};

const updateEnvValue = (content: string, key: string, value: string): string => {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, `${key}=${value}`);
  }

  return `${content.trimEnd()}\n${key}=${value}\n`;
};

const generateSecrets = (): void => {
  initEnv();

  let envContent = fs.readFileSync(envPath, "utf8");
  const updatedKeys: string[] = [];

  for (const key of generatedSecretKeys) {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
    const currentValue = match?.[1]?.trim();

    if (!currentValue || looksLikePlaceholder(currentValue)) {
      const secret = crypto.randomBytes(32).toString("hex");
      envContent = updateEnvValue(envContent, key, secret);
      updatedKeys.push(key);
    }
  }

  fs.writeFileSync(envPath, envContent, "utf8");

  if (updatedKeys.length === 0) {
    console.log("Secrets already populated");
    return;
  }

  console.log(`Generated secrets for: ${updatedKeys.join(", ")}`);
};

const loadEnv = (): void => {
  if (!fs.existsSync(envPath)) {
    throw new Error(".env file not found. Run setup:init-env first.");
  }

  dotenv.config({ path: envPath });
};

const checkEnv = (): { ok: boolean; messages: string[] } => {
  loadEnv();

  const messages: string[] = [];

  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    messages.push(`Missing required keys: ${missing.join(", ")}`);
  }

  const placeholders = requiredKeys.filter((key) =>
    looksLikePlaceholder(process.env[key])
  );
  if (placeholders.length > 0) {
    messages.push(`Replace placeholder values for: ${placeholders.join(", ")}`);
  }

  if (process.env.DATABASE_URL && looksLikePlaceholder(process.env.DATABASE_URL)) {
    messages.push("DATABASE_URL still looks like a template value");
  }

  return {
    ok: messages.length === 0,
    messages,
  };
};

const run = (command: string): void => {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: "inherit" });
};

const setupAll = (): void => {
  initEnv();
  generateSecrets();

  const result = checkEnv();
  if (!result.ok) {
    console.error("Environment check failed:");
    result.messages.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
  }

  run("npm run prisma:generate");
  run("npx prisma db push");
  run("npm run build");
  run("npm run test:auth");
  run("npm run test:auth:db");

  console.log("Setup completed successfully");
};

const command = process.argv[2];

switch (command) {
  case "init-env":
    initEnv();
    break;
  case "generate-secrets":
    generateSecrets();
    break;
  case "check-env": {
    const result = checkEnv();
    if (!result.ok) {
      console.error("Environment check failed:");
      result.messages.forEach((message) => console.error(`- ${message}`));
      process.exit(1);
    }

    console.log("Environment check passed");
    break;
  }
  case "setup-all":
    setupAll();
    break;
  default:
    console.log("Usage: ts-node ./src/scripts/setup.ts <init-env|generate-secrets|check-env|setup-all>");
    process.exit(1);
}
