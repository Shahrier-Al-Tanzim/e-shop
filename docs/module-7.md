# Module 7: Stripe Checkout Session & Webhook Order Fulfillment

We have successfully designed, built, and verified **Module 7: Stripe Checkout Session & Webhook Order Fulfillment** inside the E-Shop! The system provides a highly polished customer-facing checkout console (`/checkout`) integrating both **Cash on Delivery (COD)** and **Secure Stripe hosted payments** connected to serverless PostgreSQL event webhooks.

---

## 🔒 Edge-Shielded Checkout Authentication

Checkout routes are protected in a multi-tier authorization matrix:
1. **Edge Proxy Guards (`proxy.ts` / `auth.config.ts`)**: Scans user context. Customers trying to navigate directly to `/checkout` without active sessions are automatically redirected back to `/login?callbackUrl=/checkout`.
2. **Server-Side Validation (`app/checkout/page.tsx`)**: Re-authenticates JWT credentials on server-side component queries prior to rendering the Checkout Console.
3. **Database Transaction Guard**: Every Server Action in `app/actions/checkout.ts` re-validates the session ID against live user records prior to committing any mutations.

---

## 📝 Cash on Delivery (COD) Fulfillment

The Cash on Delivery (COD) flow is built for immediate local transactions with no external gateways:
- **Server Action (`createCodOrder`)**:
  1. Validates inputs (non-empty address/phone) and stock availability.
  2. Commits a Prisma transaction containing:
     - Creating `Order` in PostgreSQL marked as `status: PENDING` and `paymentMethod: COD`.
     - Creating `OrderItem` logs capturing static prices at the exact second of purchase.
     - Decrementing product inventory stock metrics immediately.
  3. Purges client-side Zustand shopping carts.
  4. Redirects the client directly to `/checkout/success?orderId={orderId}`.

---

## 💳 Stripe Hosted Sessions & Signature Webhooks

Secure credit card processing is designed using an asynchronous, event-driven webhooks model to guarantee transactional integrity:

### 1. Checkout Session Generation (`createStripeSession`)
- Validates active stock levels to ensure users cannot attempt checking out out-of-stock items.
- Instantiates an `Order` and its `OrderItem`s in PostgreSQL marked as `status: PENDING` and `paymentMethod: STRIPE`.
- Binds `{ orderId: order.id }` inside the Stripe Checkout session's `metadata`.
- Spawns Stripe checkout links redirecting the customer's browser window to the secure checkout terminal.

### 2. Edge Webhook Receiver (`app/api/payments/stripe-webhook/route.ts`)
- A secure edge-compatible POST endpoint receiving Stripe server events.
- **Raw body verification**: Uses `stripe.webhooks.constructEvent()` combined with `process.env.STRIPE_WEBHOOK_SECRET` to verify event payloads.
- **Fulfillment Operations (`checkout.session.completed`)**:
  - Pulls `orderId` reference parameters from Stripe metadata.
  - Commits a database transaction updating the order status to `PAID`.
  - Subtracts inventory quantities from Neon PostgreSQL database records.

---

## 🎨 Vercel Preview Dynamics

All redirection URLs, success routes, and cancel links utilize dynamic header origin queries (`headers().get("origin")`) in place of static variables. This guarantees complete compatibility with Vercel PR Review branches and Preview deployments out-of-the-box.
