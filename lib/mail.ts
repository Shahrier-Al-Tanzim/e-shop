import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

// Retrieve configuration variables from env
const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || "587");
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const fromAddress = process.env.SMTP_FROM || "E-Shop <noreply@eshop.com>";
const adminFallbackEmail = process.env.ADMIN_EMAIL || "admin@eshop.com";

// Setup nodemailer transporter
let transporter: nodemailer.Transporter | null = null;
if (user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// Simple styling helper to wrap our premium email content
const getEmailWrapper = (content: string, previewText: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E Shop Update</title>
  <style>
    body {
      background-color: #09090b;
      color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #09090b;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid #27272a;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.05em;
      color: #ffffff;
      text-decoration: none;
    }
    .content {
      padding: 32px;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #71717a;
      border-top: 1px solid #27272a;
      background-color: #09090b;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      margin-top: 0;
      color: #ffffff;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
    }
    .btn {
      display: inline-block;
      background-color: #ffffff;
      color: #09090b !important;
      font-weight: 700;
      font-size: 13px;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      margin-top: 16px;
      transition: background-color 0.2s;
    }
    .table-container {
      margin-top: 24px;
      border: 1px solid #27272a;
      border-radius: 8px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background-color: #27272a;
      color: #fafafa;
      text-align: left;
      padding: 12px;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #27272a;
      color: #d4d4d8;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .total-row td {
      font-weight: 700;
      color: #ffffff;
      background-color: #27272a;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .badge-pending { background-color: #3f2f0f; color: #fbbf24; }
    .badge-paid { background-color: #064e3b; color: #34d399; }
    .badge-processing { background-color: #1e3a8a; color: #60a5fa; }
    .badge-shipped { background-color: #14532d; color: #4ade80; }
    .badge-delivered { background-color: #052e16; color: #10b981; }
    .badge-cancelled { background-color: #7f1d1d; color: #f87171; }
  </style>
</head>
<body>
  <span style="display:none !important;visibility:hidden;mso-hide:all;font-size:1px;color:#09090b;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="#" class="logo">E Shop</a>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        © 2026 E Shop. All rights reserved.<br>
        This is an automated system email. Please do not reply directly.
      </div>
    </div>
  </div>
</body>
</html>
`;

// Helper to log mail fallback in a premium terminal interface format
function logEmailFallback(to: string, subject: string, htmlContent: string) {
  console.log("\n========================================================");
  console.log("📨 [MOCK EMAIL DISPATCH] (No SMTP Configured)");
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("----------------------- Content ------------------------");
  // Simple extraction of raw paragraphs for console readability
  const strippedText = htmlContent
    .replace(/<style([\s\S]*?)<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .trim();
  console.log(strippedText);
  console.log("========================================================\n");
}

// Fetch order details helper
async function getOrderDetails(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

// 1. Send Order Placed Emails
export async function sendOrderPlacedEmails(orderId: string) {
  try {
    const order = await getOrderDetails(orderId);
    if (!order) return;

    const customerEmail = order.user?.email;
    const customerName = order.user?.name || "Valued Customer";

    // 1.1 Compile Customer Email
    const customerSubject = `Order Placed Successfully! #${order.id.substring(0, 8)}`;
    const itemsRows = order.items
      .map(
        (item) => `
      <tr>
        <td>${item.product?.name || "Product"}</td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">$${item.priceAtPurchase.toFixed(2)}</td>
        <td style="text-align: right;">$${(item.priceAtPurchase * item.qty).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    let statusBadgeClass = "badge-pending";
    switch (order.status) {
      case "PAID": statusBadgeClass = "badge-paid"; break;
      case "PROCESSING": statusBadgeClass = "badge-processing"; break;
      case "SHIPPED": statusBadgeClass = "badge-shipped"; break;
      case "DELIVERED": statusBadgeClass = "badge-delivered"; break;
      case "CANCELLED": statusBadgeClass = "badge-cancelled"; break;
    }

    const customerContent = `
      <h1>Thank you for your order, ${customerName}!</h1>
      <p>Your order <strong>#${order.id}</strong> has been successfully received and is currently in status <span class="badge ${statusBadgeClass}">${order.status}</span>.</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Grand Total:</td>
              <td style="text-align: right;">$${order.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style="margin-top: 24px;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Shipping Details:</strong> ${order.address}</p>
      <p>We will email you updates as your package transitions through fulfillment stages.</p>
    `;

    const customerHtml = getEmailWrapper(customerContent, `Order #${order.id.substring(0, 8)} details and receipt.`);

    if (customerEmail) {
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: customerEmail,
          subject: customerSubject,
          html: customerHtml,
        });
      } else {
        logEmailFallback(customerEmail, customerSubject, customerHtml);
      }
    }

    // 1.2 Compile Admin Alert Email
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    const adminEmails = Array.from(new Set([adminFallbackEmail, ...admins.map((a) => a.email)]));

    const adminSubject = `🚨 Alert: New Order Placed #${order.id.substring(0, 8)}`;
    const adminContent = `
      <h1>New Order Received!</h1>
      <p>A new order <strong>#${order.id}</strong> has been registered in the database.</p>
      <p><strong>Customer:</strong> ${customerName} (${customerEmail || "Guest"})</p>
      <p><strong>Total Invoice Amount:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Fulfillment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Delivery Target Address:</strong> ${order.address}</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Grand Total:</td>
              <td style="text-align: right;">$${order.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style="margin-top: 24px;">Please head over to the administrator dashboard panel to oversee and verify this dispatch.</p>
    `;

    const adminHtml = getEmailWrapper(adminContent, `New order alert for admin: #${order.id.substring(0, 8)}`);

    for (const email of adminEmails) {
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: adminSubject,
          html: adminHtml,
        });
      } else {
        logEmailFallback(email, adminSubject, adminHtml);
      }
    }
  } catch (error) {
    console.error("sendOrderPlacedEmails failed:", error);
  }
}

// 2. Send Order Status Update Email
export async function sendOrderStatusUpdateEmail(orderId: string, status: string) {
  try {
    const order = await getOrderDetails(orderId);
    if (!order) return;

    const customerEmail = order.user?.email;
    if (!customerEmail) return;

    const customerName = order.user?.name || "Valued Customer";

    // Setup status specifics
    let badgeClass = "badge-pending";
    let statusPhrase = status;
    let descriptionText = `Your order status has been updated to ${status}.`;

    switch (status) {
      case "PAID":
        badgeClass = "badge-paid";
        statusPhrase = "Payment Confirmed";
        descriptionText = "Thank you! Your payment transaction has been processed and successfully verified. We are preparing your order items.";
        break;
      case "PROCESSING":
        badgeClass = "badge-processing";
        statusPhrase = "Processing";
        descriptionText = "We are currently packing and preparing your items for courier pickup.";
        break;
      case "SHIPPED":
        badgeClass = "badge-shipped";
        statusPhrase = "Shipped";
        descriptionText = "Great news! Your package has been dispatched and is currently in transit to your shipping destination address.";
        break;
      case "DELIVERED":
        badgeClass = "badge-delivered";
        statusPhrase = "Delivered";
        descriptionText = "Fulfillment complete! Your order has been successfully delivered to your target address. Please visit your profile dashboard if you would like to write reviews for your purchased items.";
        break;
      case "CANCELLED":
        badgeClass = "badge-cancelled";
        statusPhrase = "Cancelled";
        descriptionText = "This order transaction has been cancelled. If this is unexpected, please reach out to customer support admin.";
        break;
    }

    const subject = `Order #${order.id.substring(0, 8)} Status Update: ${statusPhrase}`;
    const content = `
      <h1>Order Status Update!</h1>
      <p>Hello ${customerName},</p>
      <p>The status of your order <strong>#${order.id}</strong> has transitioned to: <span class="badge ${badgeClass}">${statusPhrase}</span></p>
      
      <p style="margin-top: 16px; padding: 12px; background-color: #27272a; border-radius: 8px; font-size: 13px; color: #ffffff;">
        ${descriptionText}
      </p>

      <p style="margin-top: 24px;"><strong>Delivery Destination:</strong> ${order.address}</p>
      <p>Thank you for choosing E Shop. For full ledger updates, please view your Profile Dashboard.</p>
    `;

    const html = getEmailWrapper(content, `Order #${order.id.substring(0, 8)} is now ${statusPhrase}.`);

    if (transporter) {
      await transporter.sendMail({
        from: fromAddress,
        to: customerEmail,
        subject,
        html,
      });
    } else {
      logEmailFallback(customerEmail, subject, html);
    }
  } catch (error) {
    console.error("sendOrderStatusUpdateEmail failed:", error);
  }
}

// 3. Send Payment Received Alert to Admins
export async function sendAdminPaymentReceivedEmail(orderId: string) {
  try {
    const order = await getOrderDetails(orderId);
    if (!order) return;

    const customerEmail = order.user?.email || "Guest";
    const customerName = order.user?.name || "Valued Customer";

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    const adminEmails = Array.from(new Set([adminFallbackEmail, ...admins.map((a) => a.email)]));

    const subject = `💳 Payment Verified: Order #${order.id.substring(0, 8)}`;
    const itemsRows = order.items
      .map(
        (item) => `
      <tr>
        <td>${item.product?.name || "Product"}</td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">$${item.priceAtPurchase.toFixed(2)}</td>
        <td style="text-align: right;">$${(item.priceAtPurchase * item.qty).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    const content = `
      <h1>Payment Received Successfully!</h1>
      <p>A payment totaling <strong>$${order.total.toFixed(2)}</strong> has been verified for order <strong>#${order.id}</strong>.</p>
      <p><strong>Customer details:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Payment channel:</strong> ${order.paymentMethod}</p>
      <p><strong>Shipping destination:</strong> ${order.address}</p>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Grand Total:</td>
              <td style="text-align: right;">$${order.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p style="margin-top: 24px;">Please prepare this order for shipping as the payment has been confirmed.</p>
    `;

    const html = getEmailWrapper(content, `Payment confirmed for order #${order.id.substring(0, 8)} totaling $${order.total.toFixed(2)}.`);

    for (const email of adminEmails) {
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject,
          html,
        });
      } else {
        logEmailFallback(email, subject, html);
      }
    }
  } catch (error) {
    console.error("sendAdminPaymentReceivedEmail failed:", error);
  }
}

