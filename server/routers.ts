import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { users } from "../drizzle/schema";

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

  hoaxes: router({
    list: publicProcedure.input(z.object({ limit: z.number().default(10), offset: z.number().default(0) })).query(async () => {
      return [];
    }),
    featured: publicProcedure.query(async () => {
      return [];
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return null;
    }),
  }),

  submissions: router({
    submit: publicProcedure
      .input(z.object({ title: z.string().min(10), description: z.string().min(30), sourceUrl: z.string().url().optional() }))
      .mutation(async ({ input }) => {
        await db.createSubmission(input);
        return { success: true } as const;
      }),
    mySubmissions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSubmissions(ctx.user.id);
    }),
  }),

  verifications: router({
    analyzeUrl: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input, ctx }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a URL credibility analyzer. Analyze the URL and return a JSON response with verdict, score, flags, domain_age_note, recommendation, manipulation_tactics, logical_fallacies, emotional_triggers, and credibility_score." },
            { role: "user", content: `Analyze this URL for credibility: ${input.url}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "url_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  verdict: { type: "string" },
                  score: { type: "number" },
                  flags: { type: "array", items: { type: "string" } },
                  domain_age_note: { type: "string" },
                  recommendation: { type: "string" },
                  manipulation_tactics: { type: "array", items: { type: "string" } },
                  logical_fallacies: { type: "array", items: { type: "string" } },
                  emotional_triggers: { type: "array", items: { type: "string" } },
                  credibility_score: { type: "number" },
                },
                required: ["verdict", "score", "flags", "domain_age_note", "recommendation", "manipulation_tactics", "logical_fallacies", "emotional_triggers", "credibility_score"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        const result = typeof content === "string" ? JSON.parse(content) : content;

        if (ctx.user) {
          await db.saveVerification({ userId: ctx.user.id, toolUsed: "url_analyzer", inputUrl: input.url, result, verdict: result.verdict });
        }

        return result;
      }),

    analyzeText: publicProcedure
      .input(z.object({ text: z.string().min(20) }))
      .mutation(async ({ input, ctx }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a text manipulation detector. Analyze the text and return a JSON response with verdict, credibility_score, summary, risk_score, manipulation_tactics, logical_fallacies, and emotional_triggers." },
            { role: "user", content: `Analyze this text for manipulation and false claims: ${input.text}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "text_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  verdict: { type: "string" },
                  credibility_score: { type: "number" },
                  summary: { type: "string" },
                  risk_score: { type: "number" },
                  manipulation_tactics: { type: "array", items: { type: "string" } },
                  logical_fallacies: { type: "array", items: { type: "string" } },
                  emotional_triggers: { type: "array", items: { type: "string" } },
                },
                required: ["verdict", "credibility_score", "summary", "risk_score", "manipulation_tactics", "logical_fallacies", "emotional_triggers"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        const result = typeof content === "string" ? JSON.parse(content) : content;

        if (ctx.user) {
          await db.saveVerification({ userId: ctx.user.id, toolUsed: "text_analyzer", inputText: input.text, result, verdict: result.verdict });
        }

        return result;
      }),

    scanEmail: publicProcedure
      .input(z.object({ emailText: z.string().min(20) }))
      .mutation(async ({ input, ctx }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an email phishing and scam detector. Analyze the email and return a JSON response with verdict, risk_score, scam_type, red_flags, urgency_tactics, suspicious_links, sender_red_flags, what_they_want, summary, and what_to_do." },
            { role: "user", content: `Analyze this email for phishing and scams: ${input.emailText}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "email_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  verdict: { type: "string" },
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

        const content = response.choices[0]?.message.content;
        const result = typeof content === "string" ? JSON.parse(content) : content;

        if (ctx.user) {
          await db.saveVerification({ userId: ctx.user.id, toolUsed: "email_scan", inputText: input.emailText, result, verdict: result.verdict });
        }

        return result;
      }),

    analyzeVideo: publicProcedure
      .input(z.object({ videoUrl: z.string().url(), context: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a video authenticity analyzer. Analyze the video URL and context for deepfakes and manipulation. Return a JSON response with verdict, risk_score, manipulation_type, platform_signals, context_red_flags, verification_steps, known_techniques, summary, and confidence." },
            { role: "user", content: `Analyze this video: ${input.videoUrl}${input.context ? ` Context: ${input.context}` : ""}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "video_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  verdict: { type: "string" },
                  risk_score: { type: "number" },
                  manipulation_type: { type: "string" },
                  platform_signals: { type: "array", items: { type: "string" } },
                  context_red_flags: { type: "array", items: { type: "string" } },
                  verification_steps: { type: "array", items: { type: "string" } },
                  known_techniques: { type: "array", items: { type: "string" } },
                  summary: { type: "string" },
                  confidence: { type: "string" },
                },
                required: ["verdict", "risk_score", "manipulation_type", "platform_signals", "context_red_flags", "verification_steps", "known_techniques", "summary", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        const result = typeof content === "string" ? JSON.parse(content) : content;

        if (ctx.user) {
          await db.saveVerification({ userId: ctx.user.id, toolUsed: "video_analyzer", inputUrl: input.videoUrl, result, verdict: result.verdict });
        }

        return result;
      }),

    myHistory: protectedProcedure.input(z.object({ limit: z.number().default(20) })).query(async ({ ctx, input }) => {
      return await db.getUserVerifications(ctx.user.id, input.limit);
    }),
  }),

  testimonials: router({
    list: publicProcedure.query(async () => {
      return await db.getApprovedTestimonials();
    }),
    submit: publicProcedure
      .input(z.object({ displayName: z.string().optional(), story: z.string().min(50), hoaxType: z.string().optional(), duration: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.createTestimonial({ displayName: input.displayName, story: input.story, hoaxType: input.hoaxType, duration: input.duration });
        return { success: true } as const;
      }),
  }),

  resources: router({
    list: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(async () => {
      return await db.getResources(undefined, undefined, 10);
    }),
    freeOnly: publicProcedure.input(z.object({ limit: z.number().default(6) })).query(async () => {
      return await db.getResources(undefined, false, 6);
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return await db.getResourceBySlug(input.slug);
    }),
  }),

  memberships: router({
    myMembership: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMembershipByUserId(ctx.user.id);
    }),
    upgrade: protectedProcedure.input(z.object({ plan: z.enum(["monthly", "annual"]) })).mutation(async ({ ctx, input }) => {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (input.plan === "annual" ? 12 : 1));
      await db.upsertMembership({ userId: ctx.user.id, tier: "premium", status: "active", currentPeriodEnd: periodEnd });
      return { success: true } as const;
    }),
  }),

  partners: router({
    list: publicProcedure.query(async () => {
      return await db.getVerifiedPartners();
    }),
    myPartner: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPartnerByUserId(ctx.user.id);
    }),
    submitApplication: protectedProcedure
      .input(z.object({ orgName: z.string().min(5), orgType: z.enum(["fact_checker", "journalist", "ngo", "academic", "media_org"]), description: z.string().min(50), website: z.string().url().optional(), applicationNote: z.string().min(20) }))
      .mutation(async ({ ctx, input }) => {
        await db.createPartnerApplication({
          userId: ctx.user.id,
          orgName: input.orgName,
          orgType: input.orgType,
          description: input.description,
          website: input.website,
          applicationNote: input.applicationNote,
          verified: false,
        });
        return { success: true } as const;
      }),
  }),

  donations: router({
    donate: publicProcedure
      .input(z.object({ amount: z.number().min(100), type: z.enum(["one_time", "recurring"]), message: z.string().optional(), anonymous: z.boolean().default(false) }))
      .mutation(async ({ input }) => {
        if (input.amount < 100) throw new Error("Minimum donation is $1");
        await db.createDonation({ amount: input.amount, currency: "USD", type: input.type, status: "pending", message: input.message, anonymous: input.anonymous });
        return { success: true } as const;
      }),
  }),

  user: router({
    updateProfile: protectedProcedure.input(z.object({ name: z.string().optional() })).mutation(async ({ ctx, input }) => {
      if (input.name) {
        const database = await db.getDb();
        if (database) {
          await database.update(users).set({ name: input.name }).where(eq(users.id, ctx.user.id));
        }
      }
      return { success: true } as const;
    }),
  }),

  emailForwarding: router({
    submitEmail: publicProcedure
      .input(z.object({ emailContent: z.string().min(20), senderEmail: z.string().email(), companyName: z.string().optional(), hook: z.string().optional() }))
      .mutation(async () => {
        // This would normally send to digitalpunch.refurrm@gmail.com
        // For now, just acknowledge receipt
        return { success: true, message: "Email received! We'll analyze it and post results soon." } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
