import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  checkIfScamSender,
  createCredibilitySearch,
  createDonation,
  createPartnerApplication,
  createSubmission,
  createTestimonial,
  getApprovedTestimonials,
  getCredibilitySearchStats,
  getEmailForwardingStats,
  getFeaturedHoaxes,
  getFeaturedTestimonials,
  getFlaggedSenders,
  getHoaxBySlug,
  getMembershipByUserId,
  getPartnerByUserId,
  getPublishedHoaxes,
  getRecentCredibilitySearches,
  getResourceBySlug,
  getResources,
  getScamSenderStats,
  getUserCredibilitySearches,
  getUserEmailForwardings,
  getUserSubmissions,
  getUserVerifications,
  getVerifiedPartners,
  reportScamSender,
  saveVerification,
  submitEmailForwarding,
  updateUserProfile,
  upsertMembership,
} from "./db";

// ─── Hoaxes Router ────────────────────────────────────────────────────────────
const hoaxesRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().default(0), category: z.string().optional() }))
    .query(({ input }) => getPublishedHoaxes(input.limit, input.offset, input.category)),

  featured: publicProcedure.query(() => getFeaturedHoaxes(3)),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getHoaxBySlug(input.slug)),
});

// ─── Submissions Router ───────────────────────────────────────────────────────
const submissionsRouter = router({
  submit: publicProcedure
    .input(z.object({
      title: z.string().min(5).max(512),
      description: z.string().min(20),
      sourceUrl: z.string().url().optional().or(z.literal("")),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await createSubmission({ ...input, userId: ctx.user?.id ?? null });
      return { success: true };
    }),

  mySubmissions: protectedProcedure
    .query(({ ctx }) => getUserSubmissions(ctx.user.id)),
});

// ─── Verifications Router ─────────────────────────────────────────────────────
const verificationsRouter = router({
  myHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(({ ctx, input }) => getUserVerifications(ctx.user.id, input.limit)),

  analyzeUrl: publicProcedure
    .input(z.object({ url: z.string().min(5).max(2000) }))
    .mutation(async ({ input, ctx }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a URL and website credibility analyst specializing in misinformation detection. Analyze the provided URL for signs of misinformation, manipulation, or deception. Return a JSON object with: verdict (safe/suspicious/dangerous), score (0-100, 0=safe), flags (array of red flag strings), domain_age_note (string about domain credibility), recommendation (1-2 sentence action).",
          },
          { role: "user", content: `Analyze this URL for credibility and misinformation risk: ${input.url}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "url_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["safe", "suspicious", "dangerous"] },
                score: { type: "number" },
                flags: { type: "array", items: { type: "string" } },
                domain_age_note: { type: "string" },
                recommendation: { type: "string" },
              },
              required: ["verdict", "score", "flags", "domain_age_note", "recommendation"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = response.choices[0]?.message?.content ?? "{}";
      const result = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      if (ctx.user) {
        await saveVerification({ userId: ctx.user.id, inputUrl: input.url, toolUsed: "url_analyzer", result, verdict: result.verdict });
      }
      return result;
    }),

  analyzeText: publicProcedure
    .input(z.object({ text: z.string().min(10).max(5000) }))
    .mutation(async ({ input, ctx }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a media manipulation and misinformation expert. Analyze the provided text for manipulation tactics, logical fallacies, and emotional triggers. Return a JSON object with: verdict (credible/questionable/manipulative), manipulation_tactics (array), logical_fallacies (array), emotional_triggers (array), credibility_score (0-100, 0=very credible), summary (2-3 sentence verdict), recommendation (1-2 sentence action).",
          },
          { role: "user", content: `Analyze this text for manipulation and misinformation:\n\n${input.text}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "text_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["credible", "questionable", "manipulative"] },
                manipulation_tactics: { type: "array", items: { type: "string" } },
                logical_fallacies: { type: "array", items: { type: "string" } },
                emotional_triggers: { type: "array", items: { type: "string" } },
                credibility_score: { type: "number" },
                summary: { type: "string" },
                recommendation: { type: "string" },
              },
              required: ["verdict", "manipulation_tactics", "logical_fallacies", "emotional_triggers", "credibility_score", "summary", "recommendation"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = response.choices[0]?.message?.content ?? "{}";
      const result = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      if (ctx.user) {
        await saveVerification({ userId: ctx.user.id, inputText: input.text.slice(0, 500), toolUsed: "text_analyzer", result, verdict: result.verdict });
      }
      return result;
    }),

  scanEmail: publicProcedure
    .input(z.object({ emailText: z.string().min(20).max(10000) }))
    .mutation(async ({ input, ctx }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an email security and scam detection expert. Analyze the provided email content for phishing, scams, and social engineering. Return a JSON object with: verdict (safe/suspicious/scam/phishing/dangerous), risk_score (0-100), scam_type (string), red_flags (array), urgency_tactics (array), suspicious_links (array), sender_red_flags (array), what_they_want (string), summary (2-3 sentence verdict), what_to_do (1-2 sentence action).",
          },
          { role: "user", content: `Analyze this email for scams and phishing:\n\n${input.emailText}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "email_scan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["safe", "suspicious", "scam", "phishing", "dangerous"] },
                risk_score: { type: "number" },
                scam_type: { type: "string" },
                red_flags: { type: "array", items: { type: "string" } },
                urgency_tactics: { type: "array", items: { type: "string" } },
                suspicious_links: { type: "array", items: { type: "string" } },
                sender_red_flags: { type: "array", items: { type: "string" } },
                what_they_want: { type: "string" },
                summary: { type: "string" },
                what_to_do: { type: "string" },
              },
              required: ["verdict", "risk_score", "scam_type", "red_flags", "urgency_tactics", "suspicious_links", "sender_red_flags", "what_they_want", "summary", "what_to_do"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = response.choices[0]?.message?.content ?? "{}";
      const result = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      if (ctx.user) {
        await saveVerification({ userId: ctx.user.id, inputText: input.emailText.slice(0, 500), toolUsed: "email_scan", result, verdict: result.verdict });
      }
      return result;
    }),

  analyzeVideo: publicProcedure
    .input(z.object({ videoUrl: z.string().min(5).max(2000), context: z.string().max(1000).optional() }))
    .mutation(async ({ input, ctx }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a deepfake detection and video authenticity expert. Analyze the provided video URL and context for authenticity red flags. Return a JSON object with: verdict (likely_authentic/needs_verification/suspicious/likely_fake/known_manipulated), risk_score (0-100), manipulation_type (string), platform_signals (array), context_red_flags (array), verification_steps (array of 3-5 steps), known_techniques (array), summary (2-3 sentence assessment), confidence (high/medium/low).",
          },
          { role: "user", content: `Analyze this video for authenticity:\nURL: ${input.videoUrl}${input.context ? `\nContext: ${input.context}` : ""}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "video_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["likely_authentic", "needs_verification", "suspicious", "likely_fake", "known_manipulated"] },
                risk_score: { type: "number" },
                manipulation_type: { type: "string" },
                platform_signals: { type: "array", items: { type: "string" } },
                context_red_flags: { type: "array", items: { type: "string" } },
                verification_steps: { type: "array", items: { type: "string" } },
                known_techniques: { type: "array", items: { type: "string" } },
                summary: { type: "string" },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["verdict", "risk_score", "manipulation_type", "platform_signals", "context_red_flags", "verification_steps", "known_techniques", "summary", "confidence"],
              additionalProperties: false,
            },
          },
        },
      });
      const raw = response.choices[0]?.message?.content ?? "{}";
      const result = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      if (ctx.user) {
        await saveVerification({ userId: ctx.user.id, inputUrl: input.videoUrl, toolUsed: "video_analyzer", result, verdict: result.verdict });
      }
      return result;
    }),
});

// ─── Testimonials Router ──────────────────────────────────────────────────────
const testimonialsRouter = router({
  list: publicProcedure.query(() => getApprovedTestimonials(20)),
  featured: publicProcedure.query(() => getFeaturedTestimonials(3)),
  submit: publicProcedure
    .input(z.object({
      displayName: z.string().max(256).optional(),
      story: z.string().min(50).max(5000),
      hoaxType: z.string().max(128).optional(),
      duration: z.string().max(128).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await createTestimonial({ ...input, userId: ctx.user?.id ?? null });
      return { success: true };
    }),
});

// ─── Resources Router ─────────────────────────────────────────────────────────
const resourcesRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional(), limit: z.number().default(20) }))
    .query(({ input }) => getResources(input.category, undefined, input.limit)),

  freeOnly: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(({ input }) => getResources(undefined, false, input.limit)),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const resource = await getResourceBySlug(input.slug);
      if (!resource) throw new TRPCError({ code: "NOT_FOUND" });
      if (resource.isPremium) {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Premium content requires login" });
        const membership = await getMembershipByUserId(ctx.user.id);
        if (!membership || membership.tier !== "premium" || membership.status !== "active") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Premium membership required" });
        }
      }
      return resource;
    }),
});

// ─── Memberships Router ───────────────────────────────────────────────────────
const membershipsRouter = router({
  myMembership: protectedProcedure
    .query(({ ctx }) => getMembershipByUserId(ctx.user.id)),

  upgrade: protectedProcedure
    .input(z.object({ plan: z.enum(["monthly", "annual"]) }))
    .mutation(async ({ ctx, input }) => {
      const periodEnd = new Date();
      if (input.plan === "annual") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      await upsertMembership({
        userId: ctx.user.id,
        tier: "premium",
        status: "active",
        currentPeriodEnd: periodEnd,
      });
      return { success: true };
    }),
});

// ─── Partners Router ──────────────────────────────────────────────────────────
const partnersRouter = router({
  list: publicProcedure.query(() => getVerifiedPartners()),

  myPartner: protectedProcedure
    .query(({ ctx }) => getPartnerByUserId(ctx.user.id)),

  submitApplication: protectedProcedure
    .input(z.object({
      orgName: z.string().min(2),
      orgType: z.enum(["fact_checker", "journalist", "ngo", "academic", "media_org"]),
      website: z.string().url().optional().or(z.literal("")),
      description: z.string().min(50),
      applicationNote: z.string().min(20),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getPartnerByUserId(ctx.user.id);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Application already exists" });
      await createPartnerApplication({ ...input, userId: ctx.user.id, verified: false });
      return { success: true };
    }),
});

// ─── Donations Router ─────────────────────────────────────────────────────────
const donationsRouter = router({
  donate: publicProcedure
    .input(z.object({
      amount: z.number().min(100).max(1000000),
      type: z.enum(["one_time", "recurring"]).default("one_time"),
      message: z.string().max(500).optional(),
      anonymous: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      await createDonation({
        ...input,
        userId: ctx.user?.id ?? null,
        status: "pending",
        currency: "usd",
      });
      return { success: true, message: "Donation recorded — payment integration coming soon" };
    }),
});

// ─── Email Forwarding Router ─────────────────────────────────────────────────
const emailForwardingRouter = router({
  submit: publicProcedure
    .input(z.object({
      senderEmail: z.string().email(),
      senderName: z.string().max(256).optional(),
      companyName: z.string().max(256).optional(),
      subject: z.string().max(512).optional(),
      emailBody: z.string().min(20),
      suspiciousHooks: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await submitEmailForwarding({
        userId: ctx.user?.id ?? null,
        ...input,
      });
      return { success: true, message: "Email submitted for analysis. We'll review it and post findings on the site." };
    }),

  myForwardings: protectedProcedure.query(async ({ ctx }) => {
    return await getUserEmailForwardings(ctx.user.id);
  }),

  stats: publicProcedure.query(async () => {
    return await getEmailForwardingStats();
  }),
});

// ─── Credibility Search Router ─────────────────────────────────────────────────────
const credibilitySearchRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string().min(3).max(512) }))
    .mutation(async ({ input, ctx }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a fact-checking expert. When given a claim, analyze it thoroughly and provide a credibility assessment. Respond in JSON format with: verdict (true/false/misleading/unverified), credibilityScore (0-100), summary (1-2 sentences), and sources (array of relevant sources if available).",
          },
          { role: "user", content: `Fact-check this claim: ${input.query}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "credibility_check",
            strict: true,
            schema: {
              type: "object",
              properties: {
                verdict: { type: "string", enum: ["true", "false", "misleading", "unverified"] },
                credibilityScore: { type: "integer", minimum: 0, maximum: 100 },
                summary: { type: "string" },
                sources: { type: "array", items: { type: "string" } },
                fullAnalysis: { type: "string" },
              },
              required: ["verdict", "credibilityScore", "summary", "sources", "fullAnalysis"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      const parsed = typeof content === "string" ? JSON.parse(content) : content;

      await createCredibilitySearch({
        userId: ctx.user?.id ?? null,
        query: input.query,
        verdict: parsed.verdict,
        credibilityScore: parsed.credibilityScore,
        summary: parsed.summary,
        sources: JSON.stringify(parsed.sources),
        fullAnalysis: parsed.fullAnalysis,
      });

      return {
        verdict: parsed.verdict,
        credibilityScore: parsed.credibilityScore,
        summary: parsed.summary,
        sources: parsed.sources,
        fullAnalysis: parsed.fullAnalysis,
      };
    }),

  recent: publicProcedure.query(async () => {
    return await getRecentCredibilitySearches(10);
  }),

  mySearches: protectedProcedure.query(async ({ ctx }) => {
    return await getUserCredibilitySearches(ctx.user.id);
  }),

  stats: publicProcedure.query(async () => {
    return await getCredibilitySearchStats();
  }),
});

// ─── Scam Sender Router ─────────────────────────────────────────────────────────
const scamSenderRouter = router({
  check: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      return await checkIfScamSender(input.email);
    }),

  report: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        scamType: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await reportScamSender(input);
      return { success: true };
    }),

  flagged: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      return await getFlaggedSenders(input.limit);
    }),

  stats: publicProcedure.query(async () => {
    return await getScamSenderStats();
  }),
});

// ─── User Router ──────────────────────────────────────────────────────────────
const userRouter = router({
  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().min(1).optional(), bio: z.string().max(500).optional() }))
    .mutation(async ({ input, ctx }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  hoaxes: hoaxesRouter,
  submissions: submissionsRouter,
  verifications: verificationsRouter,
  testimonials: testimonialsRouter,
  resources: resourcesRouter,
  memberships: membershipsRouter,
  partners: partnersRouter,
  donations: donationsRouter,
  emailForwarding: emailForwardingRouter,
  credibilitySearch: credibilitySearchRouter,
  scamSender: scamSenderRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
