# Module 3: Authentication & Edge Route Guards (NextAuth)

This document details the mechanics, configuration, and security routing guards designed and implemented for the E-Shop in Module 3.

---

## 🔒 Security Architecture Overview
We integrated **Auth.js (NextAuth v5)** with our serverless Neon PostgreSQL database via **Prisma ORM**.

The system is configured with credentials authorization (email/password), secure custom cookies, edge interception via the brand new Next.js 16 `proxy.ts` convention, and dynamic role-based authorization rules.

### Decoupled Config & Edge Interception
In Next.js, route interception (formerly known as middleware, now `proxy.ts`) runs within the high-performance **Edge Runtime**. Traditional database adapters (such as Prisma Client over standard TCP connection pools) are NOT supported in the strict Edge Runtime.

To resolve this limitation, we decoupled our authentication layer into two isolated configuration layers:
1. **[auth.config.ts](file:///c:/Projects/e-shop/auth.config.ts)**: Contains edge-compatible handlers (callbacks for authorization, JWT and Session strategies, custom page triggers). This config file contains NO database drivers, allowing Next.js interceptors (`proxy.ts`) to boot rapidly and shield routes on the Edge.
2. **[auth.ts](file:///c:/Projects/e-shop/auth.ts)**: Imports `auth.config.ts`, initializes the Prisma database adapter (`@auth/prisma-adapter`), hooks credentials providers, and exports core authentication methods (`signIn`, `signOut`, `auth`, `handlers`).

```
[Incoming Request] ──> [proxy.ts (Edge Guard)] (Uses auth.config.ts, no DB)
                             │
            ┌────────────────┴──────────────┐
     [Unauthenticated]               [Authenticated]
            │                               │
    [Redirect to /login]           [Passes Request to Route]
                                            │
                                            ▼
                             [App Route / Server Component] (Uses auth.ts with Prisma/DB)
```

---

## 🛠️ Configuration Details

### 1. File: `auth.config.ts`
Establishes the core auth configuration, defining:
- **Pages**: Custom login page mapped to `/login`.
- **JWT & Session callbacks**: Expanding user role (`ADMIN` / `CUSTOMER`) and database User ID into the active JWT token and frontend session structure.
- **Authorized callback**: Edge route guard rules blocking unauthorized access.

### 2. File: `proxy.ts` (Next.js 16 Interceptor)
Satisfying the brand new Next.js 16 breaking change deprecating `middleware.ts` in favor of `proxy.ts`:
- Exports the compiled NextAuth check from `auth.config.ts`.
- Defines route match patterns covering all routes except public API requests (`/api/*`), static resources, and images.

---

## 🛣️ Route Shielding Rules

Our guard rules are defined in the `authorized` callback inside `auth.config.ts`:

| Route Path | Requirement | Behavior on Failure |
| :--- | :--- | :--- |
| `/admin/*` | Active session AND `role === "ADMIN"` | Redirects to `/login` |
| `/profile/*` | Active session (any role) | Redirects to `/login` |
| `/checkout/*` | Active session (any role) | Redirects to `/login` |
| Other paths | Publicly accessible (e.g. storefront `/`) | Permitted |

---

## ⚡ Secure Cryptography & Server Actions

### Pure JS `bcryptjs` Hashing
To prevent compilation and deployment errors on edge functions, we chose `bcryptjs` instead of the standard compiled `bcrypt` library. Since standard `bcrypt` uses native C++ bindings, it fails to compile or run in serverless/edge environments. `bcryptjs` is pure JavaScript and operates successfully across all environments.

### Actions (`app/actions/auth.ts`)
- **`registerUser`**:
  - Accepts registration requests containing `name`, `email`, and `password`.
  - Enforces simple testing-friendly validation: password must be at least 4 characters long (custom requirement).
  - Normalizes emails to lowercase, checks for duplicates, hashes passwords via `bcryptjs`, writes the `User` row into Neon Postgres with role `CUSTOMER`, and returns feedback.
- **`loginUser`**:
  - Leverages NextAuth's `signIn` helper with the credentials provider.
  - Returns credentials validation success or custom user-friendly error codes.

---

## 🎨 Premium Visual Interfaces

We built premium glassmorphic authentication pages matching our storefront theme:
- **`/login`**: Frosted glass interface, glow accents, state feedback notifications, auto-redirect on login.
- **`/register`**: Simple inputs (name, email, password only), success status feedback, and an intentional 2.5-second redirect delay allowing users to observe their successful registration.

---

## 🧪 Production Verification

Validated compile outcomes under static production Turbopack builds:
```bash
npm run build
```
- Compilation completed successfully with **zero errors**.
- Deprecation warnings cleared: `middleware.ts` completely migrated to `proxy.ts` conforming to the Next.js 16 interceptor pattern.
