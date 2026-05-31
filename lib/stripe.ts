import Stripe from "stripe";

// Provide a fallback dummy key during build time compilation when STRIPE_SECRET_KEY is not yet populated in the environment.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build_compilation";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("WARNING: STRIPE_SECRET_KEY is missing from env variables. Using compilation placeholder.");
}

export const stripe = new Stripe(stripeSecretKey);
