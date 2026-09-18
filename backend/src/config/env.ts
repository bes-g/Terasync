import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Search for .env in current directory and parent monorepo root
const candidateEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z
    .string()
    .default("4000")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  PIN_HMAC_SECRET: z.string().min(32, "PIN_HMAC_SECRET must be at least 32 characters"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${errorDetails}`);
  }
  return result.data;
}

export const env = parseEnv();
