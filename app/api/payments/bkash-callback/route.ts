import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { executeBkashPayment } from "@/app/actions/bkash";
import { createNotification } from "@/app/actions/notifications";
import { sendOrderPlacedEmails, sendOrderStatusUpdateEmail, sendAdminPaymentReceivedEmail } from "@/lib/mail";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get("paymentID");
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");

    // Dynamic origin resolving to redirect correctly in both preview and dev
    const origin = req.nextUrl.origin;

    if (!orderId) {
      console.warn("bKash callback called without orderId in query.");
      return NextResponse.redirect(`${origin}/checkout?error=bkash_invalid`);
    }

    // Check database first to prevent duplicate callbacks or status mismatch redirects from failing
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (existingOrder && existingOrder.status === "PAID") {
      console.log(`Order ${orderId} is already marked as PAID. Redirecting to success page.`);
      return NextResponse.redirect(`${origin}/checkout/success?orderId=${orderId}`);
    }

    if (status !== "success" || !paymentId) {
      console.log(`bKash payment non-success callback state: Status=${status}, PaymentId=${paymentId}`);
      
      // Update order status to CANCELLED in database to unlock product holds if cancelled/failed (only if not already paid/processed)
      if (existingOrder && existingOrder.status !== "PAID") {
        try {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" },
          });
        } catch (dbErr) {
          console.error("Failed to cancel order on callback abort:", dbErr);
        }
      }

      return NextResponse.redirect(`${origin}/checkout?error=bkash_cancelled`);
    }

    console.log(`Processing successful bKash payment verification for order: ${orderId}, PaymentID: ${paymentId}`);

    // 1. Verify/Execute the payment via bKash API
    const verification = await executeBkashPayment(paymentId);
    if (!verification.success) {
      console.error(`bKash payment verification execution failed: ${verification.error}`);
      
      // Double check if a parallel callback completed it in the database
      const doubleCheck = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (doubleCheck && doubleCheck.status === "PAID") {
        console.log(`Order ${orderId} was processed by a parallel request. Redirecting to success page.`);
        return NextResponse.redirect(`${origin}/checkout/success?orderId=${orderId}`);
      }

      return NextResponse.redirect(`${origin}/checkout?error=bkash_failed`);
    }

    // 2. Perform order PAID transition and inventory decrement in transaction
    const completedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found in database.`);
      }

      // Check if already processed to prevent duplicates
      if (order.status === "PAID") {
        console.log(`Order ${orderId} is already marked as PAID.`);
        return order;
      }

      // Update status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // Decrement inventory stock
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

      return updated;
    });

    // 3. Trigger Real-time notifications and Mailing notifications
    if (completedOrder) {
      try {
        // App Notifications
        await createNotification(
          "New bKash Payment Received",
          `Order #${completedOrder.id.substring(0, 8)} totaling $${completedOrder.total.toFixed(2)} has been paid successfully via bKash.`,
          null,
          true
        );
        
        if (completedOrder.userId) {
          await createNotification(
            "Payment Received Successfully",
            `Your bKash payment for order #${completedOrder.id.substring(0, 8)} totaling $${completedOrder.total.toFixed(2)} has been verified.`,
            completedOrder.userId,
            false
          );
        }

        // Email Alerts (Non-blocking background execution)
        sendOrderPlacedEmails(completedOrder.id).catch(err => console.error("bKash order placement mail failed:", err));
        sendOrderStatusUpdateEmail(completedOrder.id, "PAID").catch(err => console.error("bKash payment confirmation mail failed:", err));
        sendAdminPaymentReceivedEmail(completedOrder.id).catch(err => console.error("bKash admin payment alert failed:", err));
        
      } catch (notifMailErr) {
        console.error("Failed to trigger post-bKash payment notifications:", notifMailErr);
      }
    }

    // 4. Redirect customer to success dashboard
    return NextResponse.redirect(`${origin}/checkout/success?orderId=${orderId}`);

  } catch (error: any) {
    console.error("bKash callback handler failed:", error);
    const origin = req.nextUrl.origin;
    return NextResponse.redirect(`${origin}/checkout?error=bkash_system_error`);
  }
}
