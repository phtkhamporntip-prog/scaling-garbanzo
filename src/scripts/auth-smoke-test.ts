import assert from "node:assert/strict";
import request from "supertest";
import app from "../app";

const run = async (): Promise<void> => {
  const providerStatusResponse = await request(app).get(
    "/api/v1/auth/oauth/providers"
  );
  assert.equal(providerStatusResponse.status, 200);
  assert.equal(providerStatusResponse.body.success, true);
  assert.equal(Array.isArray(providerStatusResponse.body.data), true);
  assert.equal(providerStatusResponse.body.data.length, 4);
  console.log("PASS GET /api/v1/auth/oauth/providers");

  const oauthStartResponse = await request(app).get(
    "/api/v1/auth/oauth/google/start"
  );
  assert.equal(oauthStartResponse.status, 503);
  assert.equal(oauthStartResponse.body.success, false);
  assert.match(String(oauthStartResponse.body.message), /not configured/i);
  console.log("PASS GET /api/v1/auth/oauth/google/start without config");

  const currentUserResponse = await request(app).get("/api/v1/auth/me");
  assert.equal(currentUserResponse.status, 401);
  assert.equal(currentUserResponse.body.success, false);
  assert.match(String(currentUserResponse.body.message), /authorized/i);
  console.log("PASS GET /api/v1/auth/me without token");

  const bootstrapMissingSecretResponse = await request(app)
    .post("/api/v1/auth/bootstrap-admin")
    .send({
      name: "Admin",
      email: `admin-${Date.now()}@example.com`,
      password: "Secret1234",
      contactNo: "0123456789",
    });
  assert.equal(bootstrapMissingSecretResponse.status, 400);
  assert.equal(bootstrapMissingSecretResponse.body.success, false);
  console.log("PASS POST /api/v1/auth/bootstrap-admin missing secret");

  const bootstrapInvalidSecretResponse = await request(app)
    .post("/api/v1/auth/bootstrap-admin")
    .send({
      secret: "invalid-secret",
      name: "Admin",
      email: `admin-${Date.now()}@example.com`,
      password: "Secret1234",
      contactNo: "0123456789",
    });
  assert.equal(bootstrapInvalidSecretResponse.status, 401);
  assert.equal(bootstrapInvalidSecretResponse.body.success, false);
  console.log("PASS POST /api/v1/auth/bootstrap-admin invalid secret");

  const refreshResponse = await request(app)
    .post("/api/v1/auth/refresh-token")
    .send({});
  assert.equal(refreshResponse.status, 400);
  assert.equal(refreshResponse.body.success, false);
  assert.match(String(refreshResponse.body.message), /refresh token/i);
  console.log("PASS POST /api/v1/auth/refresh-token without token");

  const logoutResponse = await request(app).post("/api/v1/auth/logout").send({});
  assert.equal(logoutResponse.status, 200);
  assert.equal(logoutResponse.body.success, true);
  console.log("PASS POST /api/v1/auth/logout without token");

  console.log("Auth smoke tests passed");
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error("Auth smoke tests failed");
  console.error(message);
  process.exit(1);
});
