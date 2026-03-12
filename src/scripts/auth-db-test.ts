import assert from "node:assert/strict";
import request from "supertest";
import app from "../app";
import prisma from "../shared/prisma";

const password = "Secret123";

const RETRYABLE_ERROR_SNIPPETS = [
  "Server selection timeout",
  "ReplicaSetNoPrimary",
  "No such host is known",
  "P1001",
  "Raw query failed",
  "ECONNRESET",
  "ETIMEDOUT",
];

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_ERROR_SNIPPETS.some((snippet) => message.includes(snippet));
};

const withRetry = async <T>(
  label: string,
  task: () => Promise<T>,
  maxAttempts = 4,
  baseDelayMs = 1500
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = baseDelayMs * attempt;
      console.warn(
        `WARN ${label} failed on attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms`
      );
      await sleep(delay);
    }
  }

  throw lastError;
};

const cleanup = async (email: string): Promise<void> => {
  const existingUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  if (!existingUser) {
    return;
  }

  await prisma.refreshSession.deleteMany({
    where: { userId: existingUser.id },
  });
  await prisma.oAuthAccount.deleteMany({
    where: { userId: existingUser.id },
  });
  await prisma.user.delete({
    where: { id: existingUser.id },
  });
};

const runSingleAttempt = async (): Promise<void> => {
  const email = `auth-e2e-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.com`;

  await withRetry("db connect", async () => prisma.$connect());
  await withRetry("cleanup before test", async () => cleanup(email));

  const agent = request.agent(app);

  const registerResponse = await agent.post("/api/v1/auth/register").send({
    name: "Auth E2E User",
    email,
    password,
    role: "user",
    contactNo: "0123456789",
    address: "Bangkok",
  });
  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);
  assert.equal(registerResponse.body.data.email, email);
  console.log("PASS register user");

  const loginResponse = await agent.post("/api/v1/auth/login").send({
    email,
    password,
  });
  assert.equal(loginResponse.status, 200);
  assert.equal(loginResponse.body.success, true);
  assert.equal(typeof loginResponse.body.token, "string");
  console.log("PASS login user");

  const meByCookieResponse = await agent.get("/api/v1/auth/me");
  assert.equal(meByCookieResponse.status, 200);
  assert.equal(meByCookieResponse.body.success, true);
  assert.equal(meByCookieResponse.body.data.email, email);
  console.log("PASS get current user by cookie");

  const meByBearerResponse = await request(app)
    .get("/api/v1/auth/me")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);
  assert.equal(meByBearerResponse.status, 200);
  assert.equal(meByBearerResponse.body.success, true);
  assert.equal(meByBearerResponse.body.data.email, email);
  console.log("PASS get current user by bearer token");

  const refreshResponse = await agent.post("/api/v1/auth/refresh-token").send({});
  assert.equal(refreshResponse.status, 200);
  assert.equal(refreshResponse.body.success, true);
  assert.equal(typeof refreshResponse.body.token, "string");
  console.log("PASS refresh token");

  const logoutResponse = await agent.post("/api/v1/auth/logout").send({});
  assert.equal(logoutResponse.status, 200);
  assert.equal(logoutResponse.body.success, true);
  console.log("PASS logout user");

  const meAfterLogoutResponse = await agent.get("/api/v1/auth/me");
  assert.equal(meAfterLogoutResponse.status, 401);
  assert.equal(meAfterLogoutResponse.body.success, false);
  console.log("PASS protected route blocked after logout");

  await withRetry("cleanup after test", async () => cleanup(email));
  console.log("Database-backed auth test passed");
};

const run = async (): Promise<void> => {
  await withRetry("full auth db test", runSingleAttempt, 3, 2000);
};

run().catch(async (error: unknown) => {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore cleanup failures on test exit.
  }

  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error("Database-backed auth test failed");
  console.error(message);
  process.exit(1);
}).finally(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect failures.
  }
});
