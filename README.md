# 🚀 E-Shop - Premium Stateless E-Commerce Platform (Beta)

E-Shop is a state-of-the-art, high-fidelity, and performance-optimized stateless e-commerce application. Crafted with a dark-themed glassmorphic design language, the system is designed to run seamlessly on Edge computing runtimes with zero connection bottlenecks. Powered by modern serverless database ledgers, automated payment pipelines, and cognitive AI-driven client-side assistants.

---

## 🛠️ Technology Stack & Core Architecture

*   **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
*   **Styling**: Tailwind CSS v4 featuring premium glassmorphism filters, gradients, and micro-animations
*   **Database**: Neon Serverless PostgreSQL
*   **ORM**: Prisma ORM (with Edge client compilation capability)
*   **Authentication**: Auth.js (NextAuth v5 Beta) with email/password credentials and Google OAuth 2.0 integration
*   **Media Hosting**: Cloudinary CDN (supporting high-resolution JPEG, JPG, PNG, and WEBP image uploads up to 20MB)
*   **Payments**: Stripe Checkout + Event-driven Stripe Webhook listeners (with dual Cash-on-Delivery support)
*   **AI Integration**: Vercel AI SDK + Google Gemini 2.5 (supporting real-time database function-calling tools)
*   **State Management**: Zustand (client-side persisted shopping cart storage)

---

## 👥 Customer User Flow & Operations

Experience a fluid, interactive, and high-fidelity customer checkout pipeline:

### 1. Catalog Browsing & Multi-Dimensional Filtering
*   **Landing Page**: Browse high-fidelity card listings loaded directly from Neon Serverless PostgreSQL.
*   **Reactive Filtering**: Search products instantly by keyword query or filter catalog listings using dynamic category tags.

### 2. Persisted Shopping Cart
*   **Add to Cart**: Click **Add to Cart** on any card to slide open the interactive cart drawer.
*   **State Persistence**: Cart counts and itemized states are persisted client-side using Zustand. Users can increase, decrease, or remove items securely.

### 3. User Authentication & Profiles
*   **Sign In / Register**: Secure authentication via email/password credentials or one-click Google OAuth.
*   **My Orders & Profile Settings**: Click **My Orders** in the navbar to access a unified customer profile page:
    *   **General Profile**: Edit name, phone number, and primary shipping address securely.
    *   **Order History Ledger**: View a chronologically sorted list of past orders complete with payment channels (COD/Stripe), fulfillment statuses, billing totals, and purchased item quantities.

### 4. Checkout & Stripe Payments
*   **Payment Channels**: Complete standard checkouts utilizing cash-on-delivery (COD) or securely pay using credit cards.
*   **Stripe Gateway**: Select credit card payment to be redirected to a secure Stripe Checkout portal. Successful transactions trigger Stripe Webhook listeners to instantly register the order as `PAID` in Neon PostgreSQL.
*   **Success Window**: Enjoy a visual post-purchase success window displaying shipping addresses and purchased summaries.

### 5. Post-Launch AI Support Assistant
*   **Floating Assistant**: Toggle the global glassmorphic chatbot floating at the bottom right.
*   **Postgres Function Calling**: The assistant is preloaded with direct database querying tools:
    *   `searchProducts(query)`: Searches live database catalogs for active products.
    *   `checkStock(productId)`: Scans live inventory logs.
    *   `getOrderStatus(orderId)`: Retrieves shipment milestones, billing methods, and delivery tracking.
*   **Guardrails**: The assistant politely declines off-topic inquiries, keeping users engaged with your storefront!

---

## 👑 Administrator Flow & Operations

Manage and scale your storefront with complete backend control:

### 1. Unified Admin Dashboard
*   **Path**: Navigate to `/admin` (guarded securely by Edge middleware to block non-admin accounts).
*   **Fulfillment Operations**: View a full table listing of all transactions across the ledger. Click the **Status Dropdown** on any transaction to advance order statuses (`PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`).
*   **Analytics Overview**: Track gross revenue calculations, transaction volume metrics, and individual customer profiles.

### 2. High-Performance Product Management
*   **Path**: `/admin/products`
*   **Interactive Controls**: Create, update, or permanently delete catalog listings.
*   **Image Uploader**: Features a drag-and-drop or select uploader accepting high-resolution `.png`, `.jpg`, `.jpeg`, and `.webp` images up to **20MB**. Files are parsed as Base64 data streams and saved instantly in Cloudinary.
*   **Visibility Toggle**: Toggle `isActive` checkmarks to instantly hide/display products from public storefront catalog shelves.

### 3. Category Administration
*   **Path**: `/admin/categories`
*   **Failsafe Controls**: Create new categories dynamically. Built-in relational filters block the accidental deletion of any category currently containing active products in the warehouse.

---

## 💻 Local Development Setup & Tooling

Get your local copy up and running in minutes:

### 🔧 Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or newer)
*   A running PostgreSQL instance (or free serverless account from [Neon.tech](https://neon.tech/))
*   A free developer account on [Stripe](https://stripe.com/)
*   A free developer account on [Cloudinary](https://cloudinary.com/)
*   A free developer API key from [Google AI Studio](https://aistudio.google.com/)

### 📥 Step-by-Step Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/e-shop.git
    cd e-shop
    ```

2.  **Install Project Dependencies**:
    ```bash
    npm install
    ```

3.  **Generate local Prisma Client models**:
    ```bash
    npx prisma generate
    ```

4.  **Execute initial DB migration mapping database tables to your active PostgreSQL instance**:
    ```bash
    npx prisma db push
    ```

5.  **Pre-populate your database ledger with category defaults, role-based accounts, and premium products**:
    ```bash
    npx prisma db seed
    ```

6.  **Boot your serverless hot-reloaded development environment**:
    ```bash
    npm run dev
    ```
    *Open [http://localhost:3000](http://localhost:3000) to view your storefront.*

---

## 🔑 Environment Configuration (`.env`)

Create a `.env` file in your root directory and connect your API keys as shown below:

```env
# ==============================================================================
# DATABASE CONNECTION (Neon Serverless PostgreSQL)
# ==============================================================================
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# ==============================================================================
# AUTHENTICATION INTEGRATION (Auth.js v5)
# ==============================================================================
# Secure random string used to hash tokens. Generate one using: openssl rand -base64 32
AUTH_SECRET="your-super-secret-key"

# (Optional) Google OAuth Credentials for Social Login
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# ==============================================================================
# MEDIA HOSTING & OPTIMIZATION (Cloudinary CDN)
# ==============================================================================
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# ==============================================================================
# PAYMENT COMPILATION PIPELINE (Stripe)
# ==============================================================================
# Publishable Key (used by Frontend components)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# Secret Key (used by secure Server Actions)
STRIPE_SECRET_KEY="sk_test_..."
# Webhook Endpoint Secret (retrieved via Stripe CLI or dashboard webhook settings)
STRIPE_WEBHOOK_SECRET="whsec_..."

# ==============================================================================
# COGNITIVE AI CHAT ASSISTANT (Google Gemini)
# ==============================================================================
# Developer Key issued via Google AI Studio
GEMINI_API_KEY="AQ.your-valid-gemini-api-key"
```

---

## 🚀 Vercel Production Deployment

The entire architecture is designed stateless and compiles cleanly to Edge routes:
1. Link your repository to a new project in your **Vercel Dashboard**.
2. Copy and paste all the environment variables defined above in your project's **Environment Variables Settings**.
3. Vercel automatically runs `prisma generate && next build` to deploy your stateless application instantly!
4. **Important**: Configure your Stripe Webhook endpoint to target: `https://your-domain.vercel.app/api/payments/stripe-webhook`.
