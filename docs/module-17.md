# Module 17: bKash Payment Integration

This module integrates the **bKash Payment Gateway (Tokenized Checkout)** into the e-commerce system. Customers can checkout using their bKash wallets, complete authorization via OTP/PIN, and receive real-time updates and invoices.

---

## 📢 Feature Overview

### 1. Checkout Selection
- Adds **bKash Wallet** as a selectable checkout payment channel next to Stripe Credit Card and Cash on Delivery (COD) in the [CheckoutClient.tsx](file:///c:/Projects/e-shop/app/checkout/CheckoutClient.tsx).
- Selecting bKash initiates a backend session with the bKash API and routes the window redirect securely.

### 2. Sandbox/Production vs Mock Mode
- **Production/Sandbox API**: Executes tokenized checkouts (OTP/PIN submission webview) against the configured bKash API host.
- **Local Developer Mock Mode**: If bKash credentials are left empty in the environment variables, the system executes a mock payment loop redirecting straight back to our local callback API handler with a generated payment status, making integration instantly testable in dev environments.

---

## 🛠️ API & Database Design

### 1. Schema Modifications (`prisma/schema.prisma`)
Appends `BKASH` as a transaction type in the `PaymentMethod` enum:
```prisma
enum PaymentMethod {
  STRIPE
  COD
  BKASH
}
```

### 2. Tokenized Actions (`app/actions/bkash.ts`)
Encapsulates bKash API requests:
- `getBkashToken`: Requests tokenization credentials using the app key, secret, username, and password.
- `createBkashPayment`: Inserts a `PENDING` order into the database and issues a checkout session redirect URL.
- `executeBkashPayment`: Executes the checkout confirmation after the client completes OTP authorization.

### 3. Callback Processor (`app/api/payments/bkash-callback/route.ts`)
Processes redirect parameters:
- Verifies the transaction state.
- Executes the final transaction capture.
- Transitions the order status to `PAID` and decrements stock in a database transaction.
- Triggers customer and admin notification dashboards and emails (Order Receipts & Payment Confirmation).
- Redirects to `/checkout/success?orderId=...`.

---

## ⚙️ Configurable Credentials

Include these values in your local `.env`:
```env
# bKash API Credentials
BKASH_APP_KEY="your-bkash-app-key"
BKASH_APP_SECRET="your-bkash-app-secret"
BKASH_USERNAME="your-bkash-username"
BKASH_PASSWORD="your-bkash-password"
BKASH_BASE_URL="https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout"
```
