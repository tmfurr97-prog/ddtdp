/**
 * Stripe product and price definitions for DDTDP
 * These are the products available for purchase: Premium membership and donations
 */

export const STRIPE_PRODUCTS = {
  // Premium Membership Tiers
  PREMIUM_MONTHLY: {
    name: "Premium Monthly",
    description: "Unlimited access to all verification tools, priority support, and exclusive content",
    price: 999, // $9.99 in cents
    currency: "usd",
    interval: "month",
    metadata: {
      type: "membership",
      tier: "premium",
      duration: "monthly",
    },
  },
  PREMIUM_YEARLY: {
    name: "Premium Yearly",
    description: "Full year of premium access — save 20% vs monthly",
    price: 9999, // $99.99 in cents
    currency: "usd",
    interval: "year",
    metadata: {
      type: "membership",
      tier: "premium",
      duration: "yearly",
    },
  },

  // One-time Donations
  DONATE_SMALL: {
    name: "Small Donation",
    description: "Support media literacy for $5",
    price: 500, // $5.00 in cents
    currency: "usd",
    metadata: {
      type: "donation",
      amount: "small",
    },
  },
  DONATE_MEDIUM: {
    name: "Medium Donation",
    description: "Support media literacy for $25",
    price: 2500, // $25.00 in cents
    currency: "usd",
    metadata: {
      type: "donation",
      amount: "medium",
    },
  },
  DONATE_LARGE: {
    name: "Large Donation",
    description: "Support media literacy for $100",
    price: 10000, // $100.00 in cents
    currency: "usd",
    metadata: {
      type: "donation",
      amount: "large",
    },
  },
  DONATE_CUSTOM: {
    name: "Custom Donation",
    description: "Support media literacy with any amount",
    price: 0, // Will be set by user
    currency: "usd",
    metadata: {
      type: "donation",
      amount: "custom",
    },
  },
};

export type ProductKey = keyof typeof STRIPE_PRODUCTS;

export function getProduct(key: ProductKey) {
  return STRIPE_PRODUCTS[key];
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
