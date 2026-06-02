"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const appKey = process.env.BKASH_APP_KEY;
const appSecret = process.env.BKASH_APP_SECRET;
const username = process.env.BKASH_USERNAME;
const password = process.env.BKASH_PASSWORD;
const baseUrl = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout";

// Check if credentials are set to run in sandbox/production vs local mock mode
const isBkashConfigured = !!(appKey && appSecret && username && password);

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
  image: string;
}

// 1. Fetch bKash Token
async function getBkashToken(): Promise<string | null> {
  if (!isBkashConfigured) return null;

  try {
    const res = await fetch(`${baseUrl}/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: username!,
        password: password!,
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret,
      }),
    });

    const data = await res.json();
    return data.id_token || null;
  } catch (error) {
    console.error("bKash getBkashToken Error:", error);
    return null;
  }
}

// 2. Initiate Payment Session
export async function createBkashPayment(
  address: string,
  phone: string,
  items: CartItemInput[]
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "You must be logged in to checkout." };
    }

    if (!address.trim() || !phone.trim()) {
      return { success: false, error: "Address and Phone number are required." };
    }

    if (items.length === 0) {
      return { success: false, error: "Your shopping cart is empty." };
    }

    // Resolve Dynamic Callback Origin Host
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") || "http://localhost:3000";

    // 1. Instantiate the Order in database as PENDING
    const order = await prisma.$transaction(async (tx) => {
      // Verify stock
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product) throw new Error(`Product "${item.name}" not found.`);
        if (product.stock < item.qty) {
          throw new Error(`Insufficient stock for "${item.name}".`);
        }
      }

      const totalAmount = items.reduce((acc, i) => acc + i.price * i.qty, 0);

      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          paymentMethod: "BKASH",
          total: totalAmount,
          address: `${address} (Phone: ${phone})`,
          items: {
            create: items.map((item) => ({
              productId: item.id,
              qty: item.qty,
              priceAtPurchase: item.price,
            })),
          },
        },
      });

      return newOrder;
    });

    // 2. Resolve Redirect Target
    if (!isBkashConfigured) {
      // Mock Fallback checkout mode
      console.log(`[MOCK bKASH] Credentials empty. Generating local callback loops for Order: ${order.id}`);
      const mockCheckoutUrl = `${origin}/api/payments/bkash-callback?paymentID=mock_bkash_${Math.random().toString(36).substring(7)}&status=success&orderId=${order.id}`;
      return { success: true, url: mockCheckoutUrl };
    }

    // Create session in sandbox or live server
    const token = await getBkashToken();
    if (!token) {
      throw new Error("Failed to fetch authorization token from bKash gateway.");
    }

    // Convert total amount (usually USD in our seeds) to BDT equivalent (e.g. 1 USD = 115 BDT for sandbox payment checking)
    const bdtAmount = Math.round(order.total * 115);

    const res = await fetch(`${baseUrl}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-APP-Key": appKey!,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: "E-Shop Checkout",
        callbackURL: `${origin}/api/payments/bkash-callback?orderId=${order.id}`,
        amount: bdtAmount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: order.id,
      }),
    });

    const data = await res.json();

    if (data.statusCode && data.statusCode !== "0000") {
      throw new Error(data.statusMessage || `bKash Create Error: ${data.statusCode}`);
    }

    return { success: true, url: data.bkashURL };
  } catch (error: any) {
    console.error("createBkashPayment failed:", error);
    return { success: false, error: error.message || "Failed to initiate bKash payment transaction." };
  }
}

// 3. Execute authorized payment
export async function executeBkashPayment(paymentId: string) {
  if (!isBkashConfigured) {
    return { success: true, message: "Mock transaction verified successfully." };
  }

  try {
    const token = await getBkashToken();
    if (!token) throw new Error("Authentication failure.");

    const res = await fetch(`${baseUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-APP-Key": appKey!,
      },
      body: JSON.stringify({ paymentID: paymentId }),
    });

    const data = await res.json();
    // Status code "2062" means the payment has already been completed successfully. We treat this as success.
    if (data.statusCode && data.statusCode !== "0000" && data.statusCode !== "2062") {
      throw new Error(data.statusMessage || `bKash Execute Error: ${data.statusCode}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("executeBkashPayment Error:", error);
    return { success: false, error: error.message || "Failed to execute bKash payment." };
  }
}
