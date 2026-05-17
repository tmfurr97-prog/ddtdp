// Proposed Refactor for Stripe Webhook
import express from 'express';
import Stripe from 'stripe';
import { env } from './_core/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// IMPORTANT: This route must be defined BEFORE any global express.json() middleware
// or use a custom parser that preserves the raw body for this specific path.
export const stripeRouter = express.Router();

stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Construct event using the raw buffer (req.body)
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send('Webhook Error');
  }

  // Handle the event types securely
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // Trigger background job here instead of synchronous processing
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
