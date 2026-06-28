import { describe, expect, it } from "vitest";
import { getSafeErrorMessage } from "@/lib/safe-error-message";

describe("getSafeErrorMessage", () => {
  it("falls back for raw html payloads", () => {
    const fallback = "Failed to generate invite link.";
    const html = "<!doctype html><html><head><title>This page didn't load</title></head></html>";
    expect(getSafeErrorMessage({ message: html }, fallback)).toBe(fallback);
  });

  it("falls back for unicode-escaped html payloads", () => {
    const fallback = "Failed to generate invite link.";
    const escaped =
      "\\u003c!doctype html\\u003e\\u003chtml\\u003e\\u003chead\\u003e\\u003ctitle\\u003eThis page didn't load\\u003c/title\\u003e";
    expect(getSafeErrorMessage({ message: escaped }, fallback)).toBe(fallback);
  });

  it("returns plain user-facing error strings", () => {
    const fallback = "Failed to generate invite link.";
    expect(getSafeErrorMessage({ message: "Unauthorized" }, fallback)).toBe("Unauthorized");
  });
});
