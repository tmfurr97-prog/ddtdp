import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { memberships, donations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log("[Webhook] Processing event:", event.type, event.id);

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Webhook] Database not available");
      return res.json({ received: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[Webhook] Checkout session completed:", session.id);

        if (session.mode === "subscription") {
          // Premium membership subscription
          const userId = parseInt(session.client_reference_id || "0");
          const tier = (session.metadata?.tier as "monthly" | "yearly") || "monthly";

          if (userId) {
            await db
              .update(memberships)
              .set({
                tier: "premium",
                status: "active",
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
              })
              .where(eq(memberships.userId, userId));

            console.log("[Webhook] Premium membership activated for user:", userId);
          }
        } else if (session.mode === "payment") {
          // One-time donation
          const amount = session.amount_total || 0;
          const email = session.customer_email || session.metadata?.email || "";

          // Create donation record (if user is logged in)
          // For anonymous donations, we just log the event
          console.log("[Webhook] Donation received:", amount, "from", email);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("[Webhook] Invoice paid:", invoice.id);
        // Subscription payment succeeded
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("[Webhook] Subscription cancelled:", subscription.id);

        // Find and update membership
        const result = await db
          .select()
          .from(memberships)
          .where(eq(memberships.stripeSubscriptionId, subscription.id));

        if (result.length > 0) {
          await db
            .update(memberships)
            .set({
              status: "cancelled",
              cancelledAt: new Date(),
            })
            .where(eq(memberships.stripeSubscriptionId, subscription.id));

          console.log("[Webhook] Membership cancelled for subscription:", subscription.id);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment intent succeeded:", paymentIntent.id);

        // Update donation status if it exists
        const result = await db
          .select()
          .from(donations)
          .where(eq(donations.stripePaymentIntentId, paymentIntent.id));

        if (result.length > 0) {
          await db
            .update(donations)
            .set({ status: "completed" })
            .where(eq(donations.stripePaymentIntentId, paymentIntent.id));

          console.log("[Webhook] Donation marked as completed:", paymentIntent.id);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment intent failed:", paymentIntent.id);

        // Update donation status
        const result = await db
          .select()
          .from(donations)
          .where(eq(donations.stripePaymentIntentId, paymentIntent.id));

        if (result.length > 0) {
          await db
            .update(donations)
            .set({ status: "failed" })
            .where(eq(donations.stripePaymentIntentId, paymentIntent.id));

          console.log("[Webhook] Donation marked as failed:", paymentIntent.id);
        }
        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("[Webhook] Error processing event:", err);
    res.status(500).json({ error: err.message });
  }
}
