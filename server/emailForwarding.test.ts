import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    submitEmailForwarding: vi.fn().mockResolvedValue(undefined),
    getUserEmailForwardings: vi.fn().mockResolvedValue([]),
    getEmailForwardingStats: vi.fn().mockResolvedValue({
      total: 0,
      pending: 0,
      completed: 0,
    }),
  };
});

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "mocked" } }],
  }),
}));

describe("emailForwarding router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    caller = appRouter.createCaller(ctx);
  });

  it("should submit email forwarding", async () => {
    const result = await caller.emailForwarding.submit({
      senderEmail: "scammer@fake.com",
      senderName: "John Smith",
      companyName: "Fake Bank",
      subject: "Verify your account",
      emailBody: "Click here to verify your account immediately",
      suspiciousHooks: "Urgent deadline, asks for password",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("submitted for analysis");
  });

  it("should get email forwarding stats", async () => {
    const stats = await caller.emailForwarding.stats();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("pending");
    expect(stats).toHaveProperty("completed");
  });

  it("should require valid email for sender", async () => {
    try {
      await caller.emailForwarding.submit({
        senderEmail: "not-an-email",
        emailBody: "This is a test email body",
      });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("email");
    }
  });

  it("should require minimum email body length", async () => {
    try {
      await caller.emailForwarding.submit({
        senderEmail: "test@example.com",
        emailBody: "short",
      });
      expect.fail("Should have thrown validation error");
    } catch (err: any) {
      expect(err.message).toContain("string");
    }
  });

  it("should allow optional fields", async () => {
    const result = await caller.emailForwarding.submit({
      senderEmail: "sender@example.com",
      emailBody: "This is a suspicious email that needs analysis",
    });

    expect(result.success).toBe(true);
  });
});
