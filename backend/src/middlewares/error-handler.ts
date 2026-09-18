import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  const errorObj = err instanceof Error ? err : new Error(String(err));
  logger.error({ err: errorObj }, "Unhandled exception occurred");

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred",
    },
  });
};
