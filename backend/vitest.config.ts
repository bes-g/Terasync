import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      NODE_ENV: "test",
      PORT: "4000",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/terasync_test?schema=public",
      REDIS_URL: "redis://localhost:6379",
      JWT_ACCESS_SECRET: "test_jwt_access_secret_min_32_characters_long_12345",
      JWT_REFRESH_SECRET: "test_jwt_refresh_secret_min_32_characters_long_12345",
      PIN_HMAC_SECRET: "test_pin_hmac_secret_min_32_characters_long_12345",
    },
  },
});
