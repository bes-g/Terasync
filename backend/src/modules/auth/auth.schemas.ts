import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address").transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["BUYER", "VENDOR", "COURIER", "ADMIN"]),
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
});

export const loginSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
  requiredRole: z.enum(["BUYER", "VENDOR", "COURIER", "ADMIN"]).optional(),
});

export const verifyLoginSchema = z.object({
  challengeId: z.string().uuid("Invalid challenge ID"),
  code: z.string().length(6, "Login code must be exactly 6 digits"),
  rememberDevice: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  code: z.string().length(6, "Reset code must be exactly 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export const resendCodeSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  purpose: z.enum(["VERIFY_EMAIL", "LOGIN", "RESET_PASSWORD"]),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});