import { describe, expect, it } from "vitest";
import { SHARED_MODULE_NAME } from "../index.js";

describe("backend shared smoke test", () => {
  it("should have correct shared module name", () => {
    expect(SHARED_MODULE_NAME).toBe("@terasync/backend/shared");
  });
});
