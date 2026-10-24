import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import {
  signupSchema,
  verifyEmailSchema,
  loginSchema,
  verifyLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendCodeSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./auth.schemas.js";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";

const TRUSTED_DEVICE_COOKIE = "terasync_trusted_device";

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = signupSchema.parse(req.body);
      const result = await authService.signup(parsed);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(parsed);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.parse(req.body);
      const trustedDeviceToken = req.cookies?.[TRUSTED_DEVICE_COOKIE];
      const result = await authService.login({
        ...parsed,
        trustedDeviceToken,
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = verifyLoginSchema.parse(req.body);
      const result = await authService.verifyLogin(parsed);

      if (result.trustedDeviceToken) {
        res.cookie(TRUSTED_DEVICE_COOKIE, result.trustedDeviceToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
      }

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(parsed.email);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(parsed);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async resendCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = resendCodeSchema.parse(req.body);
      const result = await authService.resendCode(parsed);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(parsed.refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = logoutSchema.parse(req.body);
      const trustedDeviceToken = req.cookies?.[TRUSTED_DEVICE_COOKIE];
      const result = await authService.logout(parsed.refreshToken, trustedDeviceToken);

      res.clearCookie(TRUSTED_DEVICE_COOKIE);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          phoneNumber: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();