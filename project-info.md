Here's the full plan. I'll cover every layer — tech stack decisions, data model, feature scope, and the AI integration path.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) + TypeScript | SSR/SSG for SEO, API routes built in, deploys to Vercel natively |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, accessible components |
| Database | PostgreSQL via **Neon** (serverless) | Free tier, scales with Vercel, no cold starts |
| ORM | Prisma | Type-safe queries, schema migrations, works perfectly with Next.js |
| Auth | Auth.js (NextAuth v5) | Supports Google/email, built-in session management, role system |
| Image storage | Cloudinary | Free tier CDN, optimized delivery, upload API |
| Payments | Stripe (online) + Cash on Delivery flag | Industry standard, webhook support, dashboard |
| State | Zustand (cart) + React Query (server data) | Lightweight, no boilerplate |
| Deployment | Vercel | Zero-config, preview deployments, edge middleware |

---

## Data model (Prisma schema overview)

**6 core tables:**

`User` — id, name, email, role (`ADMIN` | `CUSTOMER`), address, phone, createdAt

`Product` — id, name, slug, description, price, stock, images (array), categoryId, isActive, createdAt

`Category` — id, name, slug

`Order` — id, userId, status (`PENDING` | `PAID` | `PROCESSING` | `SHIPPED` | `DELIVERED` | `CANCELLED`), paymentMethod (`STRIPE` | `COD`), total, address, createdAt

`OrderItem` — id, orderId, productId, qty, priceAtPurchase

`Cart` — stored client-side in Zustand + localStorage, synced to DB on checkout

---

## Feature breakdown

### Customer-facing
- **Product catalog** — grid with filters by category, price range, search (full-text via Prisma `contains`)
- **Product detail page** — image gallery, description, stock badge, add-to-cart
- **Cart** — persistent across sessions, quantity controls, subtotal
- **Checkout** — address form → payment choice → confirmation
- **Stripe integration** — hosted checkout session, webhook updates order status to `PAID`
- **Cash on delivery** — no payment call, order created with `COD` flag and `PENDING` status
- **Order history** — `/account/orders` with status tracking
- **Auth** — sign up/in with email+password or Google OAuth

### Admin panel (`/admin` — role-guarded via middleware)
- **Product CRUD** — create/edit/delete products with multi-image upload to Cloudinary, rich text description
- **Category management** — add/rename/delete categories
- **Order management** — view all orders, update status (e.g. mark COD as shipped/delivered)
- **Dashboard** — revenue summary, order counts, low-stock alerts

---

## Folder structure

```
/app
  /(store)          ← public storefront
    page.tsx        ← homepage
    /products/[slug]
    /cart
    /checkout
    /account
  /(admin)          ← protected
    /products
    /orders
    /dashboard
  /api
    /products       ← CRUD endpoints
    /orders
    /auth
    /payments/stripe-webhook
    /ai/chat        ← reserved for AI phase
/components
/lib
  /prisma.ts
  /stripe.ts
  /cloudinary.ts
/middleware.ts      ← role-based route guards
/prisma/schema.prisma
```

---

## Scalability decisions

Every choice here is intentional so the app doesn't hit a ceiling:

- **Neon PostgreSQL** — serverless, auto-scales connections, no connection pooling headaches on Vercel
- **Cloudinary** — CDN-distributed images, transformation on the fly (resize, webp), no storage management
- **Next.js edge middleware** — auth and role checks run at the edge, not in the DB layer
- **API routes are stateless** — any Vercel function can handle any request; no sticky sessions
- **Stripe webhooks** — payment state is event-driven, not poll-based; handles retries automatically
- **Product slugs + ISR** — product pages are statically generated and revalidated on change, so traffic spikes don't hit the DB

---

## AI assistant integration plan (post-launch)

The architecture already has `/api/ai/chat` reserved. Plugging in the assistant is a one-sprint job:

1. **Add the chat widget** — a floating button renders a `<ChatDrawer>` React component (already stubbed in the frontend layer above)
2. **Build the API route** — `/api/ai/chat` receives `{ messages, sessionId }`, calls your chosen LLM (Claude API, OpenAI, or Gemini), streams the response back via `ReadableStream`
3. **Give it context tools** (function calling):
   - `search_products(query)` — queries your Prisma DB
   - `get_order_status(orderId)` — looks up the user's order
   - `check_stock(productId)` — returns inventory
4. **Optional RAG** — add `pgvector` extension to your Neon DB, embed product descriptions, enable semantic search ("show me something warm and waterproof under $50")
5. **Scope control** — system prompt confines the assistant to your store context; it never goes off-topic

The assistant can answer "where's my order?", recommend products, handle FAQs, and escalate to a human support email — all without touching your core app code.

---

## Launch checklist

- [ ] Neon DB provisioned, `DATABASE_URL` in Vercel env vars
- [ ] Cloudinary account, upload preset configured
- [ ] Stripe account, webhook secret added, test mode → live mode on launch
- [ ] Auth.js secret + Google OAuth credentials
- [ ] `middleware.ts` protecting `/admin/*` and `/account/*`
- [ ] Vercel preview deployment for staging
- [ ] Domain connected, `NEXTAUTH_URL` updated

Want me to scaffold the actual code — starting with the Prisma schema, the product CRUD API routes, or the Stripe checkout flow?