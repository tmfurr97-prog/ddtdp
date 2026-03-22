import { z } from "zod";
import Stripe from "stripe";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { memberships, donations } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { STRIPE_PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

// ─── Stripe Payment Router ─────────────────────────────────────────────────────
export const stripeRouter = router({
  // Create checkout session for Premium membership
  createMembershipCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const product = input.tier === "monthly" ? STRIPE_PRODUCTS.PREMIUM_MONTHLY : STRIPE_PRODUCTS.PREMIUM_YEARLY;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: ctx.user?.email || undefined,
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
              recurring: {
                interval: product.interval as "month" | "year",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${ctx.req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/premium?cancelled=true`,
        client_reference_id: ctx.user?.id.toString(),
        metadata: {
          user_id: ctx.user?.id.toString(),
          customer_email: ctx.user?.email || "",
          customer_name: ctx.user?.name || "",
          tier: input.tier,
        },
        allow_promotion_codes: true,
      });

      return { sessionUrl: session.url };
    }),

  // Create checkout session for donation
  createDonationCheckout: publicProcedure
    .input(
      z.object({
        amount: z.number().min(50).max(1000000), // $0.50 to $10,000 in cents
        email: z.string().email(),
        name: z.string().optional(),
        message: z.string().max(500).optional(),
        anonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: input.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Support Media Literacy",
                description: input.message || "Help fight misinformation",
              },
              unit_amount: input.amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${ctx.req.headers.origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/donate?cancelled=true`,
        metadata: {
          email: input.email,
          name: input.name || "Anonymous",
          message: input.message || "",
          anonymous: input.anonymous.toString(),
        },
      });

      return { sessionUrl: session.url };
    }),

  // Retrieve checkout session details
  getCheckoutSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["line_items", "payment_intent"],
      });

      return {
        id: session.id,
        status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      };
    }),

  // Get user's payment history
  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.userId, ctx.user?.id || 0));

    return userDonations.map((d) => ({
      id: d.id,
      amount: d.amount,
      currency: d.currency,
      type: d.type,
      status: d.status,
      createdAt: d.createdAt,
      message: d.anonymous ? "[Anonymous donation]" : d.message,
    }));
  }),

  // Get user's membership status
  getMembershipStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const membership = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, ctx.user?.id || 0))
      .limit(1);

    if (membership.length === 0) return null;

    const m = membership[0];
    return {
      tier: m.tier,
      status: m.status,
      currentPeriodStart: m.currentPeriodStart,
      currentPeriodEnd: m.currentPeriodEnd,
      stripeSubscriptionId: m.stripeSubscriptionId,
    };
  }),

  // Cancel membership subscription
  cancelMembership: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const membership = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, ctx.user?.id || 0))
      .limit(1);

    if (membership.length === 0) throw new Error("No membership found");

    const m = membership[0];
    if (!m.stripeSubscriptionId) throw new Error("No Stripe subscription to cancel");

    await stripe.subscriptions.cancel(m.stripeSubscriptionId);

    await db
      .update(memberships)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(memberships.userId, ctx.user?.id || 0));

    return { success: true };
  }),
});

export type StripeRouter = typeof stripeRouter;
