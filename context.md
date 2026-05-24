# Project Context Ledger (`context.md`)

This file is the living context ledger for our E-Shop project. Every time we implement or modify a feature, we will update this document to keep track of what is happening, the file structure, how the code works, the tools used, and the chronological steps taken.

---

## 🚀 Project Overview
An industry-grade, highly robust, and Vercel-ready e-commerce platform built with Next.js 14+ (App Router), React 19, Tailwind CSS v4, Neon PostgreSQL, Prisma ORM, Auth.js (NextAuth v5), Cloudinary, Stripe, and an advanced AI Support Assistant.

- **Current Repository Path**: `c:\Projects\e-shop`
- **Active Git Branch**: `module-3-auth`

---

## 🗺️ Module Roadmap & Progress

| Module | Description | Status |
| :--- | :--- | :--- |
| **Module 1** | Next.js Foundation, CSS Design System, & Homepage Shell | **Completed** ✅ |
| **Module 2** | Database Setup & Prisma ORM Schema | **Completed** ✅ |
| **Module 3** | Authentication & Edge Route Guards (NextAuth) | **Completed** ✅ |
| **Module 4** | Admin Dashboard & Cloudinary Product CRUD | **Completed** ✅ |
| **Module 5** | Public Product Catalog & ISR Page Caching | *Pending* ⏳ |
| **Module 6** | Zustand Cart System with Slide-over Drawer | *Pending* ⏳ |
| **Module 7** | Stripe Checkout Session & Webhook Order Fullfilment | *Pending* ⏳ |
| **Module 8** | Order History & Administration Status Panel | *Pending* ⏳ |
| **Module 9** | Post-launch AI Support Assistant with Function Calling | *Pending* ⏳ |

---

## 🛠️ Step-by-Step Chronological History

### Step 1: Checked out separate development branch
- **What was done**: Switched the repository branch from `starting` to `module-1-foundation` to isolate this module's code changes.
- **Commands used**: `git checkout -b module-1-foundation`

### Step 2: Next.js Foundation Initialization
- **What was done**: We ran `create-next-app` in non-interactive mode. To prevent initialization errors due to the existing `project-info.md`, we temporarily moved it out to our metadata folder, ran the installer, and then moved `project-info.md` back to the root of the workspace.
- **Commands used**:
  - `Move-Item -Path "c:\Projects\e-shop\project-info.md" -Destination "<artifact-dir>"` (to clear workspace)
  - `npx -y create-next-app@latest ./ --ts --tailwind --eslint --app --import-alias "@/*" --use-npm --yes`
  - `Move-Item -Path "<artifact-dir>\project-info.md" -Destination "c:\Projects\e-shop\project-info.md"` (to restore)
- **Results**: Scaffolded Next.js 16.2.6, React 19.2.4, and Tailwind CSS v4 in the workspace root.

### Step 3: Premium Design Tokens Configuration
- **What was done**: We replaced the contents of `app/globals.css` with custom theme declarations. We declared precise HSL slate and zinc colors, set primary and violet accent variables, declared smooth transitions, enabled keyframe animations, customized scrolling bars, and set up frosted-glass panel utility classes.
- **Files modified**: `app/globals.css`

### Step 4: High-Fidelity Front-End Shell Development
- **What was done**: We replaced the standard `app/page.tsx` with a highly engaging client-side storefront. We mocked a product database, added functional "Add to Cart" handlers, constructed an interactive slide-over cart drawer, built visual interactive cards representing our upcoming modules, and built a fully functional simulated AI Support Assistant that answers questions about the tech stack, deployment, and future database seeding.
- **Files modified**: `app/page.tsx`

### Step 5: Successful Compilation & Build Verification
- **What was done**: We ran Next.js production build checks to ensure that TypeScript types, ESLint rules, and CSS configurations compile seamlessly on Turbopack without a single warning or error.
- **Commands used**: `npm run build`
- **Results**: Compiled in 2.6 seconds, producing statically optimized prerendered routes (`/` and `/_not-found`).

### Step 6: Resolved Server-Client React Hydration Discrepancies
- **What was done**: Fixed two classic React hydration mismatches:
  1. Injected extension attributes (`bis_register`, `__processed...__`) on `<body>` were solved by appending `suppressHydrationWarning` to the `<html>` and `<body>` tags.
  2. Timezone-sensitive dynamic pre-renders were resolved by converting the initial chat message dynamic time constructor to a static string (`"03:00 AM"`), keeping date calculations localized to client-side user events.
- **Files modified**: `app/layout.tsx`, `app/page.tsx`

### Step 7: Switched to Database Development Branch
- **What was done**: Created and checked out a dedicated `module-2-database` branch to isolate database and ORM tasks.
- **Commands used**: `git checkout -b module-2-database`

### Step 8: Configured Prisma 7 and Driver Adapter Dependencies
- **What was done**: Installed Prisma 7 libraries and devDependencies including `@prisma/client`, `prisma`, `tsx`, `@prisma/adapter-neon`, `@neondatabase/serverless`, `ws`, `@types/ws`, and `dotenv`.
- **Files modified**: `package.json`

### Step 9: Designed Relational Schema & Built Connection Adapter
- **What was done**:
  1. Designed the 5 core relational models (`User`, `Category`, `Product`, `Order`, `OrderItem`) with proper delete cascading rules in `prisma/schema.prisma`.
  2. Formulated the dynamic env config inside `prisma.config.ts`.
  3. Formulated the global caching `PrismaClient` adapter singleton inside `lib/prisma.ts` utilizing `ws` for secure WebSocket client queries.
- **Files modified**: `prisma/schema.prisma`, `prisma.config.ts`, `lib/prisma.ts`

### Step 10: Created Database Seed Script and Verified Build
- **What was done**:
  1. Authored `prisma/seed.ts` featuring seed data for role-based users, multi-tiered categories, and high-fidelity product listings.
  2. Executed Prisma type binding generation and completed Next.js production builds under Turbopack to verify zero-error compiling.
  3. Created specialized sub-documentation under [module-2.md](file:///c:/Projects/e-shop/docs/module-2.md).
- **Files modified**: `prisma/seed.ts`, `docs/module-2.md`

### Step 11: Switched to Authentication Development Branch
- **What was done**: Created and checked out a dedicated `module-3-auth` branch to isolate authentication work.
- **Commands used**: `git checkout -b module-3-auth`

### Step 12: Installed Auth & Cryptography Dependencies
- **What was done**: Installed `next-auth@beta`, `@auth/prisma-adapter`, `bcryptjs` (runtime) and `@types/bcryptjs` (devDependency). Chose `bcryptjs` (pure JS) over compiled `bcrypt` for edge compatibility.
- **Files modified**: `package.json`, `package-lock.json`

### Step 13: Implemented Complete Auth Layer & UI
- **What was done**:
  1. Created `auth.config.ts` with edge-compatible authorized callback, JWT/session role expansion, and custom login page.
  2. Created `auth.ts` connecting `PrismaAdapter` with Credentials provider and `bcryptjs` password comparison.
  3. Added TypeScript augmentation in `types/next-auth.d.ts` for `role` and `id` on session/JWT.
  4. Created `app/api/auth/[...nextauth]/route.ts` for NextAuth REST endpoints.
  5. Created `app/actions/auth.ts` with `registerUser` and `loginUser` Server Actions.
  6. Created premium glassmorphic `/login` and `/register` pages.
  7. Wrapped root `app/layout.tsx` in `SessionProvider`.
  8. Integrated dynamic session state into storefront navbar (greeting, role badge, sign-out, admin link).
  9. Added `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` to `.env` and `.env.example`.
- **Files modified**: `auth.config.ts`, `auth.ts`, `types/next-auth.d.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/actions/auth.ts`, `app/login/page.tsx`, `app/register/page.tsx`, `app/layout.tsx`, `app/page.tsx`, `.env`, `.env.example`

### Step 14: Migrated middleware.ts → proxy.ts & Build Verified
- **What was done**: Next.js 16 deprecated the `middleware.ts` file convention in favor of `proxy.ts`. Deleted `middleware.ts` and created `proxy.ts` at the root with identical NextAuth route guard logic. Ran `npm run build` — compiled successfully in 4.9s with zero errors, proxy recognised as `ƒ Proxy (Middleware)`, all 6 routes prerendered.
- **Files modified**: `proxy.ts` (new), `middleware.ts` (deleted), `docs/module-3.md` (new)

### Step 15: Implemented Complete Admin Layer & UI (Module 4)
- **What was done**:
  1. Configured Cloudinary integration with seamless fallback in `lib/cloudinary.ts`.
  2. Implemented admin server actions in `app/actions/admin.ts` for product details, categories, and order fulfillment status updates, fully protected with edge-safe administrative guards.
  3. Created dynamic role-guarded parent dashboard layout in `app/(admin)/admin/layout.tsx`.
  4. Built administrative overview dashboard page `/admin` querying live database metrics (sales, active listings, and inventory warning levels).
  5. Implemented categories management panel `/admin/categories` alongside interactive React 19 forms `<CategoryForm />`.
  6. Constructed products grid catalog listing `/admin/products` displaying custom badges.
  7. Built product creation page `/admin/products/new` and product editing page `/admin/products/[id]/edit` incorporating path aliases and async `params` parsing.
  8. Implemented transaction monitor `/admin/orders` featuring client-side `<OrderStatusDropdown />` updating states reactively via Server Actions in transition flows.
  9. Executed successful production compilation check (`npm run build`) in 3.8 seconds with zero warnings or errors.
- **Files modified**: `lib/cloudinary.ts` (new), `app/actions/admin.ts` (new), `app/(admin)/admin/layout.tsx` (new), `app/(admin)/admin/page.tsx` (new), `app/(admin)/admin/categories/page.tsx` (new), `app/(admin)/admin/categories/CategoryForm.tsx` (new), `app/(admin)/admin/products/page.tsx` (new), `app/(admin)/admin/products/new/page.tsx` (new), `app/(admin)/admin/products/new/NewProductForm.tsx` (new), `app/(admin)/admin/products/[id]/edit/page.tsx` (new), `app/(admin)/admin/products/[id]/edit/EditProductForm.tsx` (new), `app/(admin)/admin/orders/page.tsx` (new), `app/(admin)/admin/orders/OrderStatusDropdown.tsx` (new), `docs/module-4.md` (new)

---

## 💡 Code Mechanics & Tool Explanations

### 1. Next.js 16 (App Router) & React 19
- **How it works**: Uses the modern directory layout under `/app` where directories define URLs and `page.tsx` represents the view. Layouts (`layout.tsx`) wrap children in their sub-trees.
- **Special tools used**: 
  - `create-next-app`: The official boilerplate generator from the Next.js team. It sets up standard configurations, Babel/SWC compiler settings, TypeScript `tsconfig.json`, ESLint rules, and PostCSS.
  - `npx`: Node Package Runner. Running `npx -y create-next-app@latest` allows executing the latest CLI tool directly without globally installing it.

### 2. Tailwind CSS v4 (CSS-first Engine)
- **How it works**: Unlike older versions of Tailwind (v3 and below), **Tailwind v4 does not use a `tailwind.config.js` or `tailwind.config.ts`** file! It uses a brand-new, CSS-first architecture. 
- **Configuration Details**: 
  - All Tailwind configurations, including theme extensions, are written directly inside the `app/globals.css` file using standard CSS rules and the `@theme` directive.
  - The build process is powered by the `@tailwindcss/postcss` plugin specified in `postcss.config.mjs`, which automatically compiles utility classes inside your JS/TSX components on the fly during development and builds.
  - The `@import "tailwindcss";` directive replaces the old `@tailwind base; @tailwind components; @tailwind utilities;` syntax.

### 3. Premium HSL Token Colors & Glassmorphism
- **How it works**: We set color tokens using standard CSS variables under `:root` and registered them using the `@theme` block in Tailwind v4. Under the hood:
  - `.glass-panel` utilizes a semi-transparent dark zinc color `rgba(24,24,27,0.6)` combined with a background filter `backdrop-filter: blur(12px)` and a subtle semi-transparent border, creating an ultra-premium frosted-glass appearance that responds to our background neon glow gradients.
  - Custom scrollbars are styled to blend seamlessly with the dark backdrop, eliminating jarring default browser scrolling bars.

### 4. Interactive simulated AI Chat Assistant
- **How it works**: Standard react state `useState` manages the open/close triggers of the drawer, user text input, and message history logs. 
  - The text handler matches keywords using simple RegExp checks (`stack`, `vercel`, `roadmap`, `cart`) to return specific answers about the e-shop stack, deployment models, and cart implementation, simulating a live LLM experience.
  - In Module 9, this exact chat component will be wired to `/api/ai/chat` using AI SDK streams (Gemini/Claude) and SQL-querying function calls to perform real product and order tracking.

### 5. Prisma 7 Configuration & Database Separation
- **How it works**: In Prisma 7, static schemas inside `schema.prisma` are decoupled from dynamic connection URLs. We created `prisma.config.ts` loading environment settings via `dotenv/config` and wrapping datasource links in the `defineConfig` block, preparing the app for both serverless and local container operations.

### 6. Neon Serverless Postgres Driver Adapters
- **How it works**: Serverless functions running at the Edge cannot easily sustain standard TCP connection pools. We resolved this by employing `@neondatabase/serverless` and `@prisma/adapter-neon`. The driver adapter converts database protocol queries over WebSockets (`ws`) instead of raw TCP, enabling rapid scaling and scale-to-zero capabilities with zero connection-count crashes.

### 7. Global-caching Client Singleton Pattern
- **How it works**: Fast hot-reload in Next.js development routinely tears down and recreates runtime modules, which leaks database connection pools. We bound the PrismaClient instance to a global variable `globalThis.prismaGlobal` to persist and share a single connection pool across hot-reloads.

### 8. Auth.js v5 (NextAuth) — Decoupled Edge Architecture
- **How it works**: Auth.js v5 uses a split-config pattern. `auth.config.ts` holds edge-safe callback definitions (no DB drivers), while `auth.ts` hydrates the full configuration with database adapters. This split is critical because the proxy interceptor runs in the Edge Runtime where Node.js native modules (like TCP database drivers) are unavailable.
- **Key exports from `auth.ts`**: `auth` (session reader), `signIn`, `signOut`, `handlers` (GET/POST for API route).
- **Credentials flow**: User submits email/password → `signIn("credentials", ...)` → `authorize()` in `auth.ts` queries Prisma for the user → `bcryptjs.compare()` verifies password → JWT token issued with `role` and `id` claims.

### 9. Next.js 16 Proxy Convention (formerly Middleware)
- **How it works**: Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`. Both serve identical purposes — running server-side code before a request completes — but using `middleware.ts` now triggers a deprecation warning. Only one `proxy.ts` file is allowed per project, placed at the workspace root.
- **Our implementation**: `proxy.ts` exports `NextAuth(authConfig).auth` and a matcher config, intercepting all non-API, non-static routes to enforce authentication and role checks.

