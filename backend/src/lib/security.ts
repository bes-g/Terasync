import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Pre-computed bcrypt cost 12 hash for dummy comparison (anti-enumeration timing equalization)
const DUMMY_HASH = "$2b$12$K8y4rJ3P8G9c1Q2e3W4r5u6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m.";

const COMMON_PASSWORDS = new Set([
  "password123",
  "1234567890",
  "qwerty12345",
  "admin123456",
  "password2024",
  "password2025",
  "password2026",
  "terasync123",
  "changeme123",
]);

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, message: "Password is too common and easily guessable" };
  }
  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function dummyTimingEqualize(): Promise<void> {
  await bcrypt.compare("dummy_timing_password", DUMMY_HASH);
}

export function generateSixDigitCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashSha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}