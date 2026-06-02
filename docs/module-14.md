# Module 14: Real-Time Order Notifications & Nav Badges

This module implements a persistent, role-based notification alert system in the e-shop. Customers receive live notifications about their order status updates (e.g. payment verified, package shipped/delivered), and administrators receive alerts for new incoming order checkouts.

---

## 🔔 Feature Overview

### 1. Customer Notifications
- **Status Updates**: Automated triggers generate notifications whenever an order changes state (`PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Interactive Alerts Dashboard**: Accessible via the "Profile & Orders" dashboard under a dedicated "Notifications" tab.
- **Mark as Read**: Customers can individually mark notifications as read or use a "Mark all as read" shortcut.

### 2. Admin Broadcast Alerts
- **Incoming Checkout Alerts**: New COD checkouts or verified Stripe payments register a notification targeted to the administrative dashboard (`isAdmin: true`).
- **Navbar Alerts Badge**: A pulsing numeric badge highlights new unread administrative items in the navbar header.

---

## 🛠️ Architecture & Database Design

### 1. Database Model (`prisma/schema.prisma`)
Scaffolds a database-level `Notification` table:
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String?  // Target user (null for admin alerts)
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  isRead    Boolean  @default(false)
  isAdmin   Boolean  @default(false) // Targeted for administrative panel
  createdAt DateTime @default(now())
}
```

### 2. Server Actions (`app/actions/notifications.ts`)
Exposes CRUD actions:
- `createNotification`: Creates database alerts.
- `getNotifications`: Fetches alerts based on user role/privileges.
- `getUnreadCount`: Queries unread notifications to sync client navigation badges.
- `markAsRead` / `markAllAsRead`: Updates states in PostgreSQL and triggers page revalidations.
