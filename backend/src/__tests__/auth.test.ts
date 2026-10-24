import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();

describe("Authentication & Email Verification Suite", { timeout: 20000 }, () => {
  const testEmail = "buyer.test@example.com";
  const testPassword = "SecurePassword123!";
  const testFullName = "Test Buyer User";

  beforeAll(async () => {
    // Clean up test data
    await prisma.authCode.deleteMany({ where: { email: { in: [testEmail, "admin.attempt@example.com", "lockout.test@example.com"] } } });
    await prisma.trustedDevice.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: [testEmail, "admin.attempt@example.com", "lockout.test@example.com"] } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("1. Public signup as ADMIN is forbidden", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "admin.attempt@example.com",
      password: testPassword,
      role: "ADMIN",
      fullName: "Malicious Admin Attempt",
    });

    expect(res.status).toBe(403);
    expect(res.body.error?.message).toMatch(/ADMIN is not permitted/i);
  });

  it("2. Signup creates unverified user and generates verification code", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: testEmail,
      password: testPassword,
      role: "BUYER",
      fullName: testFullName,
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testEmail);

    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(user).toBeDefined();
    expect(user?.emailVerifiedAt).toBeNull();

    const authCode = await prisma.authCode.findFirst({
      where: { email: testEmail, purpose: "VERIFY_EMAIL" },
    });
    expect(authCode).toBeDefined();
  });

  it("3. Unverified user cannot log in", async () => {
    const res = await request(app).post("/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(403);
    expect(res.body.error?.message).toMatch(/verify your email/i);
  });

  it("4. Verify email with valid code activates account and returns tokens", async () => {
    // For test purposes, retrieve the code from DB or generate known hash
    const authCode = await prisma.authCode.findFirst({
      where: { email: testEmail, purpose: "VERIFY_EMAIL", consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    expect(authCode).toBeDefined();

    // Since code is hashed in DB, set a known hash for 6-digit code '987654'
    const crypto = await import("node:crypto");
    const testCode = "987654";
    const testHash = crypto.createHash("sha256").update(testCode).digest("hex");
    await prisma.authCode.update({
      where: { id: authCode!.id },
      data: { codeHash: testHash },
    });

    const res = await request(app).post("/auth/verify-email").send({
      email: testEmail,
      code: testCode,
    });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);

    const updatedUser = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(updatedUser?.emailVerifiedAt).not.toBeNull();
  });

  it("5. Login with verified account returns 2FA challenge without tokens", async () => {
    const res = await request(app).post("/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.requires2FA).toBe(true);
    expect(res.body.challengeId).toBeDefined();
    expect(res.body.accessToken).toBeUndefined();
  });

  it("6. Login verify with incorrect code increments attempts; max 5 attempts blocks code", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: testEmail,
      password: testPassword,
    });
    const challengeId = loginRes.body.challengeId;

    // Fail 4 times
    for (let i = 0; i < 4; i++) {
      const failRes = await request(app).post("/auth/login/verify").send({
        challengeId,
        code: "000000",
      });
      expect(failRes.status).toBe(400);
    }

    // 5th attempt
    const fail5Res = await request(app).post("/auth/login/verify").send({
      challengeId,
      code: "000000",
    });
    expect(fail5Res.status).toBe(400);

    // 6th attempt: Max attempts exceeded
    const fail6Res = await request(app).post("/auth/login/verify").send({
      challengeId,
      code: "000000",
    });
    expect(fail6Res.status).toBe(400);
    expect(fail6Res.body.error?.message).toMatch(/Maximum attempts exceeded/i);
  });

  it("7. Login verify with valid code and rememberDevice sets trusted device cookie", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: testEmail,
      password: testPassword,
    });
    const challengeId = loginRes.body.challengeId;

    const crypto = await import("node:crypto");
    const testCode = "654321";
    const testHash = crypto.createHash("sha256").update(testCode).digest("hex");
    await prisma.authCode.update({
      where: { id: challengeId },
      data: { codeHash: testHash },
    });

    const verifyRes = await request(app).post("/auth/login/verify").send({
      challengeId,
      code: testCode,
      rememberDevice: true,
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.accessToken).toBeDefined();
    expect(verifyRes.body.refreshToken).toBeDefined();

    const cookies = verifyRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/terasync_trusted_device/);

    // Subsequent login with trusted device cookie skips 2FA
    const trustedLoginRes = await request(app)
      .post("/auth/login")
      .set("Cookie", cookies[0])
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(trustedLoginRes.status).toBe(200);
    expect(trustedLoginRes.body.requires2FA).toBe(false);
    expect(trustedLoginRes.body.accessToken).toBeDefined();
  });

  it("8. Account lockout after 5 failed password attempts", async () => {
    const lockoutEmail = "lockout.test@example.com";
    await request(app).post("/auth/signup").send({
      email: lockoutEmail,
      password: testPassword,
      role: "BUYER",
      fullName: "Lockout Test",
    });

    // Mark verified
    await prisma.user.update({
      where: { email: lockoutEmail },
      data: { emailVerifiedAt: new Date() },
    });

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post("/auth/login").send({
        email: lockoutEmail,
        password: "WrongPassword123!",
      });
      expect(res.status).toBe(401);
    }

    // 5th attempt locks the account
    const lockRes = await request(app).post("/auth/login").send({
      email: lockoutEmail,
      password: "WrongPassword123!",
    });
    expect(lockRes.status).toBe(429);
    expect(lockRes.body.error?.message).toMatch(/temporarily locked/i);

    // Even with correct password, login is blocked
    const blockedRes = await request(app).post("/auth/login").send({
      email: lockoutEmail,
      password: testPassword,
    });
    expect(blockedRes.status).toBe(429);
  });

  it("9. Refresh token rotation and reuse detection", async () => {
    // Log in to get tokens
    const loginRes = await request(app).post("/auth/login").send({
      email: testEmail,
      password: testPassword,
    });
    const challengeId = loginRes.body.challengeId;

    const crypto = await import("node:crypto");
    const testCode = "112233";
    const testHash = crypto.createHash("sha256").update(testCode).digest("hex");
    await prisma.authCode.update({
      where: { id: challengeId },
      data: { codeHash: testHash },
    });

    const verifyRes = await request(app).post("/auth/login/verify").send({
      challengeId,
      code: testCode,
    });

    const initialRefreshToken = verifyRes.body.refreshToken;

    // First refresh succeeds and rotates
    const refreshRes = await request(app).post("/auth/refresh").send({
      refreshToken: initialRefreshToken,
    });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeDefined();
    const rotatedRefreshToken = refreshRes.body.refreshToken;

    // Reusing the initial refresh token triggers reuse detection
    const reuseRes = await request(app).post("/auth/refresh").send({
      refreshToken: initialRefreshToken,
    });

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error?.message).toMatch(/reuse detected/i);

    // The rotated token is now also invalidated due to session revocation
    const revokedRes = await request(app).post("/auth/refresh").send({
      refreshToken: rotatedRefreshToken,
    });
    expect(revokedRes.status).toBe(401);
  });

  it("10. Password reset revokes active sessions", async () => {
    // Request forgot password
    const forgotRes = await request(app).post("/auth/password/forgot").send({
      email: testEmail,
    });
    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.message).toMatch(/reset code has been sent/i);

    const resetCodeRecord = await prisma.authCode.findFirst({
      where: { email: testEmail, purpose: "RESET_PASSWORD" },
      orderBy: { createdAt: "desc" },
    });
    expect(resetCodeRecord).toBeDefined();

    const crypto = await import("node:crypto");
    const resetCode = "889900";
    const testHash = crypto.createHash("sha256").update(resetCode).digest("hex");
    await prisma.authCode.update({
      where: { id: resetCodeRecord!.id },
      data: { codeHash: testHash },
    });

    const newPassword = "BrandNewPassword2026!";
    const resetRes = await request(app).post("/auth/password/reset").send({
      email: testEmail,
      code: resetCode,
      newPassword,
    });

    expect(resetRes.status).toBe(200);

    // Login with new password works
    const loginRes = await request(app).post("/auth/login").send({
      email: testEmail,
      password: newPassword,
    });
    expect(loginRes.status).toBe(200);
  });

  it("11. GET /me returns authenticated user details", async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    const { generateAccessToken } = await import("../lib/security.js");
    const token = generateAccessToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role,
      fullName: user!.fullName,
    });

    const res = await request(app).get("/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.fullName).toBe(testFullName);
    expect(res.body.user.role).toBe("BUYER");
  });
});