import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  createDonation: vi.fn().mockResolvedValue(undefined),
  createPartnerApplication: vi.fn().mockResolvedValue(undefined),
  createSubmission: vi.fn().mockResolvedValue(undefined),
  createTestimonial: vi.fn().mockResolvedValue(undefined),
  getApprovedTestimonials: vi.fn().mockResolvedValue([]),
  getFeaturedHoaxes: vi.fn().mockResolvedValue([]),
  getFeaturedTestimonials: vi.fn().mockResolvedValue([]),
  getHoaxBySlug: vi.fn().mockResolvedValue(null),
  getMembershipByUserId: vi.fn().mockResolvedValue(null),
  getPartnerByUserId: vi.fn().mockResolvedValue(null),
  getPublishedHoaxes: vi.fn().mockResolvedValue([]),
  getResourceBySlug: vi.fn().mockResolvedValue(null),
  getResources: vi.fn().mockResolvedValue([]),
  getUserSubmissions: vi.fn().mockResolvedValue([]),
  getUserVerifications: vi.fn().mockResolvedValue([]),
  getVerifiedPartners: vi.fn().mockResolvedValue([]),
  saveVerification: vi.fn().mockResolvedValue(undefined),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  upsertMembership: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          verdict: "safe",
          score: 10,
          flags: [],
          domain_age_note: "Domain is well-established",
          recommendation: "This URL appears safe to visit.",
          manipulation_tactics: [],
          logical_fallacies: [],
          emotional_triggers: [],
          credibility_score: 15,
          summary: "The text appears credible.",
          risk_score: 5,
          scam_type: "none",
          red_flags: [],
          urgency_tactics: [],
          suspicious_links: [],
          sender_red_flags: [],
          what_they_want: "nothing",
          what_to_do: "No action needed.",
          manipulation_type: "none",
          platform_signals: [],
          context_red_flags: [],
          verification_steps: ["Check the source"],
          known_techniques: [],
          confidence: "high",
        }),
      },
    }],
  }),
}));

// ─── Context Factories ────────────────────────────────────────────────────────
function createPublicContext(): TrpcContext {
  const clearedCookies: unknown[] = [];
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: (_n: string, _o: unknown) => clearedCookies.push({ _n, _o }) } as TrpcContext["res"],
  };
}

function createAuthContext(overrides: Partial<NonNullable<TrpcContext["user"]>> = {}): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  const user: NonNullable<TrpcContext["user"]> = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    ctx: {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: (name: string, options: Record<string, unknown>) => clearedCookies.push({ name, options }) } as TrpcContext["res"],
    },
    clearedCookies,
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result?.name).toBe("Test User");
  });

  it("logout clears session cookie", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── Hoaxes Tests ─────────────────────────────────────────────────────────────
describe("hoaxes", () => {
  it("list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.hoaxes.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("featured returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.hoaxes.featured();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Submissions Tests ────────────────────────────────────────────────────────
describe("submissions", () => {
  it("submit works for public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.submissions.submit({
      title: "Test Misinformation Claim About Something",
      description: "This is a test description of a false claim that needs to be verified by the team.",
      sourceUrl: "https://example.com",
    });
    expect(result).toEqual({ success: true });
  });

  it("mySubmissions requires auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.submissions.mySubmissions()).rejects.toThrow();
  });

  it("mySubmissions returns array for auth user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.submissions.mySubmissions();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Verifications Tests ──────────────────────────────────────────────────────
describe("verifications", () => {
  it("analyzeUrl returns verdict", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.verifications.analyzeUrl({ url: "https://example.com" });
    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("flags");
  });

  it("analyzeText returns verdict", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.verifications.analyzeText({ text: "This is a test text that needs to be analyzed for manipulation." });
    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("credibility_score");
  });

  it("scanEmail returns verdict", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.verifications.scanEmail({ emailText: "From: test@example.com\nSubject: Test\n\nThis is a test email that needs to be scanned for phishing." });
    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("risk_score");
  });

  it("analyzeVideo returns verdict", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.verifications.analyzeVideo({ videoUrl: "https://youtube.com/watch?v=test" });
    expect(result).toHaveProperty("verdict");
    expect(result).toHaveProperty("risk_score");
  });

  it("myHistory requires auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.verifications.myHistory({ limit: 10 })).rejects.toThrow();
  });
});

// ─── Testimonials Tests ───────────────────────────────────────────────────────
describe("testimonials", () => {
  it("list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.testimonials.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("submit works for public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.testimonials.submit({
      story: "I was fooled by misinformation and it changed my perspective. Now I always verify before sharing anything online. This platform helped me understand the tactics used.",
    });
    expect(result).toEqual({ success: true });
  });
});

// ─── Resources Tests ──────────────────────────────────────────────────────────
describe("resources", () => {
  it("list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.resources.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("freeOnly returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.resources.freeOnly({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Memberships Tests ────────────────────────────────────────────────────────
describe("memberships", () => {
  it("myMembership requires auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.memberships.myMembership()).rejects.toThrow();
  });

  it("myMembership returns null for new user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.memberships.myMembership();
    expect(result).toBeNull();
  });

  it("upgrade requires auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.memberships.upgrade({ plan: "monthly" })).rejects.toThrow();
  });

  it("upgrade succeeds for auth user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.memberships.upgrade({ plan: "annual" });
    expect(result).toEqual({ success: true });
  });
});

// ─── Partners Tests ───────────────────────────────────────────────────────────
describe("partners", () => {
  it("list returns array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.partners.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("submitApplication requires auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.partners.submitApplication({
      orgName: "Test Org",
      orgType: "fact_checker",
      description: "A test organization that does fact-checking work across multiple platforms and regions.",
      applicationNote: "We want to partner to expand our reach.",
    })).rejects.toThrow();
  });

  it("submitApplication works for auth user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.partners.submitApplication({
      orgName: "Test Fact Check Org",
      orgType: "fact_checker",
      description: "A test organization that does fact-checking work across multiple platforms and regions worldwide.",
      applicationNote: "We want to partner to expand our reach and collaborate on misinformation research.",
    });
    expect(result).toEqual({ success: true });
  });
});

// ─── Donations Tests ──────────────────────────────────────────────────────────
describe("donations", () => {
  it("donate works for public user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.donations.donate({ amount: 1000, type: "one_time", anonymous: false });
    expect(result.success).toBe(true);
  });

  it("donate rejects invalid amount", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.donations.donate({ amount: 50, type: "one_time", anonymous: false })).rejects.toThrow();
  });
});

// ─── User Tests ───────────────────────────────────────────────────────────────
describe("user", () => {
  it("updateProfile requires auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.user.updateProfile({ name: "New Name" })).rejects.toThrow();
  });

  it("updateProfile works for auth user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.user.updateProfile({ name: "Updated Name" });
    expect(result).toEqual({ success: true });
  });
});
