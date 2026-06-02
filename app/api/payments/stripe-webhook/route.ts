import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { createNotification } from "@/app/actions/notifications";
import { sendOrderPlacedEmails, sendOrderStatusUpdateEmail, sendAdminPaymentReceivedEmail } from "@/lib/mail";


export async function POST(req: Request) {
  let body = "";
  try {
    body = await req.text();
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to read request body text" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CRITICAL: STRIPE_WEBHOOK_SECRET env variable is not configured.");
    return NextResponse.json({ error: "Webhook secret missing on server" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Stripe Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      console.log(`Processing successful Stripe payment webhook for order: ${orderId}`);

      try {
        const completedOrder = await prisma.$transaction(async (tx) => {
          // 1. Fetch the Order details
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          if (!order) {
            throw new Error(`Order ${orderId} not found during webhook execution.`);
          }

          // 2. Prevent double processing
          if (order.status === "PAID") {
            console.log(`Order ${orderId} is already marked as PAID.`);
            return;
          }

          // 3. Update the Order status to PAID
          await tx.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });

          // 4. Decrement inventory stock dynamically
          for (const item of order.items) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    decrement: item.qty,
                  },
                },
              });
            }
          }

          console.log(`Order ${orderId} successfully completed and stock decremented.`);
          return order;
        });

        if (completedOrder) {
          try {
            await createNotification(
              "New Stripe Payment Received",
              `Order #${completedOrder.id.substring(0, 8)} totaling $${completedOrder.total.toFixed(2)} has been paid successfully via Stripe.`,
              null,
              true
            );
            if (completedOrder.userId) {
              await createNotification(
                "Payment Received Successfully",
                `Your payment for order #${completedOrder.id.substring(0, 8)} totaling $${completedOrder.total.toFixed(2)} has been verified.`,
                completedOrder.userId,
                false
              );
            }
          } catch (notiErr) {
            console.error("Failed to trigger Stripe notifications:", notiErr);
          }

          // Trigger email updates for customer and admins (Non-blocking background execution)
          sendOrderPlacedEmails(completedOrder.id).catch(err => console.error("Stripe order placement mail failed:", err));
          sendOrderStatusUpdateEmail(completedOrder.id, "PAID").catch(err => console.error("Stripe payment confirmation mail failed:", err));
          sendAdminPaymentReceivedEmail(completedOrder.id).catch(err => console.error("Stripe admin payment alert failed:", err));
        }
      } catch (dbError: any) {
        console.error(`Database transaction error inside webhook: ${dbError.message}`);
        return NextResponse.json(
          { error: `Database Transaction Error: ${dbError.message}` },
          { status: 500 }
        );
      }
    } else {
      console.warn("Webhook checkout session completed without orderId in metadata.");
    }
  }

  return NextResponse.json({ received: true });
}
