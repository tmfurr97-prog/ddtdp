import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    checkIfScamSender: vi.fn().mockResolvedValue(null),
    reportScamSender: vi.fn().mockResolvedValue(undefined),
    getFlaggedSenders: vi.fn().mockResolvedValue([]),
    getScamSenderStats: vi.fn().mockResolvedValue({
      total: 0,
      critical: 0,
      high: 0,
      avgReports: 0,
    }),
  };
});

describe("scamSender router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    caller = appRouter.createCaller(ctx);
  });

  it("should check if email is flagged", async () => {
    const result = await caller.scamSender.check({
      email: "scammer@example.com",
    });

    expect(result).toBeNull();
  });

  it("should report a scam sender", async () => {
    const result = await caller.scamSender.report({
      email: "phisher@example.com",
      scamType: "phishing",
      severity: "high",
      description: "Fake bank phishing attempt",
    });

    expect(result).toEqual({ success: true });
  });

  it("should get flagged senders list", async () => {
    const result = await caller.scamSender.flagged({ limit: 50 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get scam sender stats", async () => {
    const stats = await caller.scamSender.stats();

    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("critical");
    expect(stats).toHaveProperty("high");
    expect(stats).toHaveProperty("avgReports");
  });

  it("should validate email format", async () => {
    try {
      await caller.scamSender.check({ email: "not-an-email" });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("email");
    }
  });

  it("should enforce limit boundaries", async () => {
    try {
      await caller.scamSender.flagged({ limit: 101 });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("number");
    }
  });

  it("should validate severity enum", async () => {
    try {
      await caller.scamSender.report({
        email: "test@example.com",
        severity: "invalid" as any,
      });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("Invalid option");
    }
  });
});
