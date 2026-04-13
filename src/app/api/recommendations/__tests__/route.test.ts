import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/recommendations/route";
import { NextRequest } from "next/server";

// Helper to create a NextRequest with JSON body
function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/recommendations", () => {
  // ─── Valid payloads ─────────────────────────────────────────────

  it("returns sessionId for valid minimal payload", async () => {
    const res = await POST(makeRequest({ budget: "medium" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.sessionId).toBeTruthy();
    expect(data.sessionId).toMatch(/^[a-f0-9-]{36}$/);
  });

  it("returns sessionId for complete payload", async () => {
    const res = await POST(
      makeRequest({
        budget: "medium",
        duration: "week",
        period: "spring",
        group: "couple",
        pace: "balanced",
        interests: ["food", "art"],
      }),
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.sessionId).toBeTruthy();
  });

  it("accepts all budget values", async () => {
    for (const budget of ["low", "medium", "high", "premium"]) {
      const res = await POST(makeRequest({ budget }));
      expect(res.status).toBe(200);
    }
  });

  it("accepts all group values", async () => {
    for (const group of ["solo", "couple", "friends", "family"]) {
      const res = await POST(makeRequest({ budget: "medium", group }));
      expect(res.status).toBe(200);
    }
  });

  it("accepts all pace values", async () => {
    for (const pace of ["relaxed", "balanced", "dense"]) {
      const res = await POST(makeRequest({ budget: "medium", pace }));
      expect(res.status).toBe(200);
    }
  });

  // ─── Invalid payloads ───────────────────────────────────────────

  it("rejects missing budget", async () => {
    const res = await POST(makeRequest({ duration: "week" }));
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toContain("budget");
  });

  it("rejects invalid budget value", async () => {
    const res = await POST(makeRequest({ budget: "infinite" }));
    expect(res.status).toBe(422);
  });

  it("rejects invalid duration value", async () => {
    const res = await POST(makeRequest({ budget: "medium", duration: "forever" }));
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toContain("duration");
  });

  it("rejects invalid period value", async () => {
    const res = await POST(makeRequest({ budget: "medium", period: "monsoon" }));
    expect(res.status).toBe(422);
  });

  it("rejects invalid group value", async () => {
    const res = await POST(makeRequest({ budget: "medium", group: "army" }));
    expect(res.status).toBe(422);
  });

  it("rejects invalid pace value", async () => {
    const res = await POST(makeRequest({ budget: "medium", pace: "extreme" }));
    expect(res.status).toBe(422);
  });

  it("rejects interests as non-array", async () => {
    const res = await POST(makeRequest({ budget: "medium", interests: "food" }));
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toContain("tableau");
  });

  it("rejects more than 3 interests", async () => {
    const res = await POST(
      makeRequest({ budget: "medium", interests: ["food", "art", "history", "nature"] }),
    );
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toContain("3");
  });

  it("rejects invalid interest value", async () => {
    const res = await POST(
      makeRequest({ budget: "medium", interests: ["food", "surfing"] }),
    );
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.error).toContain("surfing");
  });

  it("rejects empty body", async () => {
    const req = new NextRequest("http://localhost:3000/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects non-JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
