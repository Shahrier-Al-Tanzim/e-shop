"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

interface CartItemInput {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
  image: string;
}

export async function createCodOrder(
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

    // Run database operations in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify stock levels for all products
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`Product "${item.name}" not found in our catalog.`);
        }

        if (product.stock < item.qty) {
          throw new Error(
            `Insufficient stock for "${item.name}". Only ${product.stock} units available.`
          );
        }
      }

      // 2. Compute total amount
      const totalAmount = items.reduce((acc, i) => acc + i.price * i.qty, 0);

      // 3. Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          paymentMethod: "COD",
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

      // 4. Decrement inventory stock immediately for COD orders
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });
      }

      return newOrder;
    });

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("COD Checkout Error:", error);
    return { success: false, error: error.message || "An unexpected checkout error occurred." };
  }
}

export async function createStripeSession(
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

    // Resolve Origin dynamically to support preview deployments out of the box
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") || "http://localhost:3000";

    // Run database order instantiation inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify stock levels for all products
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`Product "${item.name}" not found in our catalog.`);
        }

        if (product.stock < item.qty) {
          throw new Error(
            `Insufficient stock for "${item.name}". Only ${product.stock} units available.`
          );
        }
      }

      // 2. Compute total amount
      const totalAmount = items.reduce((acc, i) => acc + i.price * i.qty, 0);

      // 3. Create the Order in PENDING status
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          paymentMethod: "STRIPE",
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

    // Create Stripe checkout line items
    const lineItems = items.map((item) => {
      const isHttpImg = item.image.startsWith("http") || item.image.startsWith("data:image");
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: isHttpImg ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      };
    });

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        orderId: order.id,
      },
      success_url: `${origin}/checkout/success?orderId=${order.id}`,
      cancel_url: `${origin}/checkout?error=payment_cancelled`,
    });

    return { success: true, url: stripeSession.url };
  } catch (error: any) {
    console.error("Stripe Checkout Session Error:", error);
    return { success: false, error: error.message || "An unexpected Stripe checkout error occurred." };
  }
}
