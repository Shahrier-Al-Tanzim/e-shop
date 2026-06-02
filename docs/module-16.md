# Module 16: Mailing & SMTP Notifications

This module implements SMTP email integration using **Nodemailer**. It delivers styled HTML order updates directly to customers at key stages of the order lifecycle and alerts store administrators of new orders.

---

## 📬 Feature Overview

### 1. Customer Order Lifecycle Emails
Customers receive distinct, professionally designed email notifications triggered by status changes on their orders:
- **Order Placed**: Sent immediately upon checkout (e.g., Cash on Delivery). Displays an itemized summary, quantity, individual prices, total cost, and delivery target.
- **Payment Confirmed**: Sent when the order status updates to `PAID` (such as via verified Stripe payment webhooks).
- **Processing**: Sent when the administration sets the order to `PROCESSING`, notifying the customer that items are being prepared.
- **Shipped**: Sent when the order is marked `SHIPPED`, informing the user that items are in transit.
- **Delivered**: Sent when the order status transitions to `DELIVERED`, concluding the cycle and prompting review writing.
- **Cancelled**: Sent in the event of an order cancellation.

### 2. Admin Placement Alerts
Whenever any customer places an order, the system automatically dispatches a detailed order transaction report to all registered store administrators (`ADMIN` role) and the designated `ADMIN_EMAIL`.

---

## 🛠️ Architecture & Integration

### 1. SMTP Transporter & Template Factory (`lib/mail.ts`)
- Configures a secure Nodemailer client utilizing environment variables.
- **Graceful Fallback**: If SMTP environment configurations are left empty, the code captures the dispatch parameters and prints the styled email details to the server console log in a structured terminal block, avoiding any checkout blocks or failures.
- **Visual Design**: Templates utilize dark-themed accents (harmonized HSL colors, container borders, clean font hierarchies) mirroring the storefront UI.

### 2. Integration Points
- **COD Checkout (`app/actions/checkout.ts`)**: Triggers order receipt and admin notifications immediately upon successful database transaction completion.
- **Stripe Webhook Receiver (`app/api/payments/stripe-webhook/route.ts`)**: Triggers customer receipt, admin notifications, and the "Payment Confirmed" notification once Stripe completes session checkout authorizations.
- **Admin Status Actions (`app/actions/admin.ts`)**: Listens to changes inside `updateOrderStatus` and dispatches status-specific updates to the customer.

---

## ⚙️ Environment Configuration

Add the following credentials to your local `.env` configuration file:

```env
# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-app-password"
SMTP_FROM="E-Shop <noreply@yourdomain.com>"
ADMIN_EMAIL="admin-alerts@yourdomain.com"
```
