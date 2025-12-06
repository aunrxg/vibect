import { describe, it, expect } from "vitest";
import { testApp } from "./setup";

describe("Health check", () => {
  it("should return OK status", async () => {
    const response = await testApp.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
    });
  });
});
