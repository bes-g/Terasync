import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { authController } from "./modules/auth/auth.controller.js";
import { authenticateJwt } from "./modules/auth/auth.middleware.js";

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS allow-list (open for development/api access with credentials for cookies)
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  // Cookie parser for trusted device token
  app.use(cookieParser());

  // HTTP request logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === "/health",
      },
    }),
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root landing endpoint
  app.get("/", (req, res) => {
    if (req.accepts("html")) {
      res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TeraSync Platform</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 2.25rem; max-width: 520px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { margin-top: 0; font-size: 1.75rem; color: #38bdf8; }
    p { color: #94a3b8; line-height: 1.6; margin: 0.75rem 0; }
    .badge { display: inline-block; background: #059669; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
    .links { margin-top: 1.5rem; }
    .links a { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; }
    .links a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● Server Online</span>
    <h1>TeraSync Platform</h1>
    <p>Automotive &amp; Industrial Spare Parts Reverse-RFQ Marketplace with Escrow Settlement.</p>
    <p>The backend API service is running smoothly.</p>
    <div class="links">
      <a href="/health">Check Health Endpoint (/health)</a>
    </div>
  </div>
</body>
</html>`);
      return;
    }
    res.status(200).json({ name: "TeraSync API", status: "ok" });
  });

  // Health endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Authentication endpoints
  app.use("/auth", authRouter);

  // Direct /me endpoint
  app.get("/me", authenticateJwt, (req, res, next) => authController.getMe(req, res, next));

  // Central error handler
  app.use(errorHandler);

  return app;
}