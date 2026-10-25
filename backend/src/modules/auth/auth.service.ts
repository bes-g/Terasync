import crypto from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import {
  hashPassword,
  verifyPassword,
  dummyTimingEqualize,
  validatePasswordStrength,
  generateSixDigitCode,
  hashSha256,
  generateSecureToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../lib/security.js";
import {
  getEmailProvider,
  getVerifyEmailTemplate,
  getLoginCodeTemplate,
  getPasswordResetTemplate,
} from "../../lib/email/index.js";
import { logger } from "../../lib/logger.js";
import { AppError } from "../../middlewares/error-handler.js";
import type { Role, User, AuthCodePurpose } from "@prisma/client";

export class AuthService {
  private emailProvider = getEmailProvider();

  async signup(data: { email: string; password: string; role: Role; fullName: string }) {
    const passwordCheck = validatePasswordStrength(data.password);
    if (!passwordCheck.valid) {
      throw new AppError(400, "WEAK_PASSWORD", passwordCheck.message || "Password does not meet security requirements");
    }

    if (data.role === "ADMIN") {
      throw new AppError(403, "FORBIDDEN", "Registration as ADMIN is not permitted");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      if (existingUser.emailVerifiedAt) {
        throw new AppError(409, "USER_EXISTS", "An account with this email already exists");
      }
      // If unverified user already exists, update info and send a fresh code
      const passwordHash = await hashPassword(data.password);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          fullName: data.fullName,
          role: data.role,
          passwordHash,
        },
      });
    } else {
      const passwordHash = await hashPassword(data.password);
      await prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          passwordHash,
          emailVerifiedAt: null,
          status: "ACTIVE",
        },
      });
    }

    const code = generateSixDigitCode();
    const codeHash = hashSha256(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.authCode.create({
      data: {
        email: data.email,
        purpose: "VERIFY_EMAIL",
        codeHash,
        expiresAt,
      },
    });

    const template = getVerifyEmailTemplate(code, 15);
    let emailSent = false;
    try {
      await this.emailProvider.sendEmail({
        to: data.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      emailSent = true;
    } catch (emailErr) {
      logger.error({ err: emailErr, email: data.email }, "Failed to send email verification code via SMTP");
    }

    return {
      message: "Verification code sent to your email",
      email: data.email,
      backupCode: !emailSent ? code : undefined,
    };
  }

  async verifyEmail(data: { email: string; code: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    if (user.emailVerifiedAt) {
      throw new AppError(400, "ALREADY_VERIFIED", "Email is already verified. Please log in.");
    }

    const authCode = await prisma.authCode.findFirst({
      where: {
        email: data.email,
        purpose: "VERIFY_EMAIL",
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!authCode) {
      throw new AppError(400, "INVALID_CODE", "No active verification code found. Please request a new one.");
    }

    if (authCode.expiresAt < new Date()) {
      throw new AppError(400, "EXPIRED_CODE", "Verification code has expired. Please request a new one.");
    }

    if (authCode.attempts >= 5) {
      throw new AppError(400, "MAX_ATTEMPTS_EXCEEDED", "Maximum attempts exceeded. Please request a new code.");
    }

    const inputHash = hashSha256(data.code);
    if (authCode.codeHash !== inputHash) {
      await prisma.authCode.update({
        where: { id: authCode.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError(400, "INVALID_CODE", "Invalid verification code");
    }

    // Mark code consumed and mark user email verified
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.authCode.update({
        where: { id: authCode.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    // Issue tokens
    const tokens = await this.issueTokens(updatedUser);

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        status: updatedUser.status,
      },
      ...tokens,
    };
  }

  async login(data: { email: string; password: string; trustedDeviceToken?: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Timing attack mitigation for unknown users
    if (!user) {
      await dummyTimingEqualize();
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError(
        429,
        "ACCOUNT_LOCKED",
        `Account is temporarily locked due to consecutive failed attempts. Try again in ${remainingMinutes} minute(s).`,
      );
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);
    if (!isMatch) {
      const nextFailCount = user.failedLoginCount + 1;
      const shouldLock = nextFailCount >= 5;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: nextFailCount,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      if (shouldLock) {
        throw new AppError(
          429,
          "ACCOUNT_LOCKED",
          "Account is temporarily locked for 15 minutes due to too many failed login attempts.",
        );
      }
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    if (!user.emailVerifiedAt) {
      throw new AppError(403, "EMAIL_UNVERIFIED", "Please verify your email address before logging in");
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(403, "ACCOUNT_SUSPENDED", "Your account has been suspended. Please contact support.");
    }

    // Reset login failures on successful password verification
    if (user.failedLoginCount > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lockedUntil: null },
      });
    }

    // Check trusted device (never bypass for ADMIN - admin always requires email OTP)
    if (data.trustedDeviceToken && user.role !== "ADMIN") {
      const tokenHash = hashSha256(data.trustedDeviceToken);
      const trustedDevice = await prisma.trustedDevice.findFirst({
        where: {
          userId: user.id,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (trustedDevice) {
        logger.info({ userId: user.id }, "Login with trusted device - bypassing 2FA code");
        const tokens = await this.issueTokens(user);
        return {
          requires2FA: false,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
          },
          ...tokens,
        };
      }
    }

    // Generate 2FA login code
    const code = generateSixDigitCode();
    const codeHash = hashSha256(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const authCode = await prisma.authCode.create({
      data: {
        email: user.email,
        purpose: "LOGIN",
        codeHash,
        expiresAt,
      },
    });

    const template = getLoginCodeTemplate(code, 10);
    let emailSent = false;
    try {
      await this.emailProvider.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      emailSent = true;
    } catch (emailErr) {
      logger.error({ err: emailErr, email: user.email }, "Failed to send 2FA login email via SMTP");
    }

    return {
      requires2FA: true,
      challengeId: authCode.id,
      message: emailSent
        ? "Verification code sent to your email"
        : "Verification code generated.",
      backupCode: !emailSent || user.role === "ADMIN" ? code : undefined,
    };
  }

  async verifyLogin(data: { challengeId: string; code: string; rememberDevice?: boolean }) {
    const authCode = await prisma.authCode.findUnique({
      where: { id: data.challengeId },
    });

    if (!authCode || authCode.purpose !== "LOGIN" || authCode.consumedAt) {
      throw new AppError(400, "INVALID_CHALLENGE", "Invalid or expired login challenge");
    }

    if (authCode.expiresAt < new Date()) {
      throw new AppError(400, "EXPIRED_CODE", "Login code has expired. Please log in again.");
    }

    if (authCode.attempts >= 5) {
      throw new AppError(400, "MAX_ATTEMPTS_EXCEEDED", "Maximum attempts exceeded. Please log in again.");
    }

    const inputHash = hashSha256(data.code);
    if (authCode.codeHash !== inputHash) {
      await prisma.authCode.update({
        where: { id: authCode.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError(400, "INVALID_CODE", "Invalid login code");
    }

    const user = await prisma.user.findUnique({
      where: { email: authCode.email },
    });

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    await prisma.authCode.update({
      where: { id: authCode.id },
      data: { consumedAt: new Date() },
    });

    const tokens = await this.issueTokens(user);

    let newTrustedDeviceToken: string | undefined;
    if (data.rememberDevice && user.role !== "ADMIN") {
      newTrustedDeviceToken = generateSecureToken(32);
      const tokenHash = hashSha256(newTrustedDeviceToken);
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await prisma.trustedDevice.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
      ...tokens,
      trustedDeviceToken: newTrustedDeviceToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.emailVerifiedAt) {
      // 60-second cooldown check
      const recentCode = await prisma.authCode.findFirst({
        where: {
          email,
          purpose: "RESET_PASSWORD",
          createdAt: { gt: new Date(Date.now() - 60 * 1000) },
        },
      });

      if (!recentCode) {
        const code = generateSixDigitCode();
        const codeHash = hashSha256(code);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.authCode.create({
          data: {
            email,
            purpose: "RESET_PASSWORD",
            codeHash,
            expiresAt,
          },
        });

        const template = getPasswordResetTemplate(code, 15);
        await this.emailProvider.sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      }
    } else {
      // Timing equality
      await dummyTimingEqualize();
    }

    // Always return uniform message to prevent enumeration
    return {
      message: "If an account exists for this email, a reset code has been sent.",
    };
  }

  async resetPassword(data: { email: string; code: string; newPassword: string }) {
    const passwordCheck = validatePasswordStrength(data.newPassword);
    if (!passwordCheck.valid) {
      throw new AppError(400, "WEAK_PASSWORD", passwordCheck.message || "Password is too weak");
    }

    const authCode = await prisma.authCode.findFirst({
      where: {
        email: data.email,
        purpose: "RESET_PASSWORD",
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!authCode) {
      throw new AppError(400, "INVALID_CODE", "No active password reset code found.");
    }

    if (authCode.expiresAt < new Date()) {
      throw new AppError(400, "EXPIRED_CODE", "Password reset code has expired.");
    }

    if (authCode.attempts >= 5) {
      throw new AppError(400, "MAX_ATTEMPTS_EXCEEDED", "Maximum attempts exceeded. Please request a new reset code.");
    }

    const inputHash = hashSha256(data.code);
    if (authCode.codeHash !== inputHash) {
      await prisma.authCode.update({
        where: { id: authCode.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError(400, "INVALID_CODE", "Invalid reset code");
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const newPasswordHash = await hashPassword(data.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      prisma.authCode.update({
        where: { id: authCode.id },
        data: { consumedAt: new Date() },
      }),
      // Revoke all refresh tokens
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message: "Password has been successfully reset. Please log in with your new password.",
    };
  }

  async resendCode(data: { email: string; purpose: AuthCodePurpose }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Anti-enumeration: return standard success
      return { message: "If an account exists, a new code has been sent." };
    }

    // 60-second cooldown
    const recentCode = await prisma.authCode.findFirst({
      where: {
        email: data.email,
        purpose: data.purpose,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentCode) {
      throw new AppError(429, "RATE_LIMITED", "Please wait 60 seconds before requesting another code.");
    }

    // Limit to 5 per hour
    const hourlyCount = await prisma.authCode.count({
      where: {
        email: data.email,
        purpose: data.purpose,
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (hourlyCount >= 5) {
      throw new AppError(429, "RATE_LIMITED", "Too many codes requested. Please try again in an hour.");
    }

    const code = generateSixDigitCode();
    const codeHash = hashSha256(code);
    const expiresAt = new Date(Date.now() + (data.purpose === "LOGIN" ? 10 : 15) * 60 * 1000);

    const authCode = await prisma.authCode.create({
      data: {
        email: data.email,
        purpose: data.purpose,
        codeHash,
        expiresAt,
      },
    });

    let template;
    if (data.purpose === "VERIFY_EMAIL") {
      template = getVerifyEmailTemplate(code, 15);
    } else if (data.purpose === "LOGIN") {
      template = getLoginCodeTemplate(code, 10);
    } else {
      template = getPasswordResetTemplate(code, 15);
    }

    await this.emailProvider.sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return {
      message: "A new verification code has been sent.",
      challengeId: data.purpose === "LOGIN" ? authCode.id : undefined,
    };
  }

  async refreshToken(rawRefreshToken: string) {
    try {
      verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError(401, "INVALID_TOKEN", "Invalid refresh token");
    }

    const tokenHash = hashSha256(rawRefreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new AppError(401, "INVALID_TOKEN", "Refresh token not found");
    }

    // Token Reuse Detection: If token is revoked, revoke all tokens for this user!
    if (tokenRecord.revokedAt) {
      logger.warn({ userId: tokenRecord.userId }, "Refresh token reuse detected! Revoking all sessions.");
      await prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new AppError(401, "TOKEN_REUSE_DETECTED", "Token reuse detected. All sessions revoked. Please log in again.");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new AppError(401, "TOKEN_EXPIRED", "Refresh token expired");
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
    });

    if (!user || user.status === "SUSPENDED") {
      throw new AppError(401, "INACTIVE_USER", "User account is inactive");
    }

    // Rotate token
    const newRawRefreshToken = generateRefreshToken({ userId: user.id, tokenId: crypto.randomUUID() });
    const newTokenHash = hashSha256(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt,
        },
      }),
      prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          revokedAt: new Date(),
          replacedByTokenId: tokenRecord.id,
        },
      }),
    ]);

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string, trustedDeviceToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashSha256(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    if (trustedDeviceToken) {
      const tokenHash = hashSha256(trustedDeviceToken);
      await prisma.trustedDevice.deleteMany({
        where: { tokenHash },
      });
    }

    return { message: "Successfully logged out" };
  }

  private async issueTokens(user: User) {
    const tokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const rawRefreshToken = generateRefreshToken({
      userId: user.id,
      tokenId,
    });

    const tokenHash = hashSha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}

export const authService = new AuthService();