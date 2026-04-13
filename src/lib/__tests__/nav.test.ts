import { describe, it, expect } from "vitest";
import { buildUrl } from "@/lib/nav";

describe("buildUrl", () => {
  // ─── Basic routes without sid ─────────────────────────────────

  it("home → /", () => {
    expect(buildUrl("home")).toBe("/");
  });

  it("quiz → /quiz", () => {
    expect(buildUrl("quiz")).toBe("/quiz");
  });

  it("results without sid → /quiz (fallback)", () => {
    expect(buildUrl("results")).toBe("/quiz");
  });

  it("destination without sid → /destination/slug", () => {
    expect(buildUrl("destination", "lisbonne")).toBe("/destination/lisbonne");
  });

  it("itinerary without sid → /itinerary/slug", () => {
    expect(buildUrl("itinerary", "lisbonne")).toBe("/itinerary/lisbonne");
  });

  it("compare without sid → /compare?slugs=a,b", () => {
    expect(buildUrl("compare", "lisbonne,porto")).toBe("/compare?slugs=lisbonne,porto");
  });

  // ─── Routes with sid ──────────────────────────────────────────

  it("results with sid → /results?sid=xxx", () => {
    expect(buildUrl("results", undefined, "abc-123")).toBe("/results?sid=abc-123");
  });

  it("destination with sid → /destination/slug?sid=xxx", () => {
    expect(buildUrl("destination", "lisbonne", "abc-123")).toBe(
      "/destination/lisbonne?sid=abc-123",
    );
  });

  it("itinerary with sid → /itinerary/slug?sid=xxx", () => {
    expect(buildUrl("itinerary", "lisbonne", "abc-123")).toBe(
      "/itinerary/lisbonne?sid=abc-123",
    );
  });

  it("compare with sid → /compare?slugs=a,b&sid=xxx", () => {
    expect(buildUrl("compare", "lisbonne,porto", "abc-123")).toBe(
      "/compare?slugs=lisbonne,porto&sid=abc-123",
    );
  });

  // ─── Edge cases ───────────────────────────────────────────────

  it("null sid treated as absent", () => {
    expect(buildUrl("results", undefined, null)).toBe("/quiz");
  });

  it("empty string sid treated as absent", () => {
    expect(buildUrl("results", undefined, "")).toBe("/quiz");
  });

  it("home ignores sid", () => {
    expect(buildUrl("home", undefined, "abc")).toBe("/");
  });

  it("quiz ignores sid", () => {
    expect(buildUrl("quiz", undefined, "abc")).toBe("/quiz");
  });
});
