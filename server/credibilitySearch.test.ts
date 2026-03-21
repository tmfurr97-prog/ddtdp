import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createCredibilitySearch: vi.fn().mockResolvedValue(undefined),
    getUserCredibilitySearches: vi.fn().mockResolvedValue([]),
    getRecentCredibilitySearches: vi.fn().mockResolvedValue([]),
    getCredibilitySearchStats: vi.fn().mockResolvedValue({
      total: 0,
      completed: 0,
      avgScore: 0,
    }),
  };
});

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            verdict: "false",
            credibilityScore: 15,
            summary: "This claim is factually incorrect.",
            sources: ["https://example.com/fact1", "https://example.com/fact2"],
            fullAnalysis: "Detailed analysis of why this is false.",
          }),
        },
      },
    ],
  }),
}));

describe("credibilitySearch router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    caller = appRouter.createCaller(ctx);
  });

  it("should search and return credibility result", async () => {
    const result = await caller.credibilitySearch.search({
      query: "Did Chuck Norris die?",
    });

    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("credibilityScore");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("sources");
    expect(result).toHaveProperty("fullAnalysis");
  });

  it("should return valid verdict types", async () => {
    const result = await caller.credibilitySearch.search({
      query: "Is the earth flat?",
    });

    expect(["true", "false", "misleading", "unverified"]).toContain(result.verdict);
  });

  it("should return credibility score between 0-100", async () => {
    const result = await caller.credibilitySearch.search({
      query: "Did NASA fake the moon landing?",
    });

    expect(result.credibilityScore).toBeGreaterThanOrEqual(0);
    expect(result.credibilityScore).toBeLessThanOrEqual(100);
  });

  it("should get recent searches", async () => {
    const recent = await caller.credibilitySearch.recent();
    expect(Array.isArray(recent)).toBe(true);
  });

  it("should get credibility search stats", async () => {
    const stats = await caller.credibilitySearch.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("completed");
    expect(stats).toHaveProperty("avgScore");
  });

  it("should require minimum query length", async () => {
    try {
      await caller.credibilitySearch.search({ query: "ab" });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("string");
    }
  });

  it("should enforce maximum query length", async () => {
    try {
      const longQuery = "a".repeat(513);
      await caller.credibilitySearch.search({ query: longQuery });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("string");
    }
  });
});
