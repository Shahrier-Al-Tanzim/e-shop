import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import SuccessClient from "./SuccessClient";

export const metadata = {
  title: "Order Placed Successfully | E Shop",
  description: "Your premium order has been successfully placed in our database.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId;

  if (!orderId || typeof orderId !== "string") {
    notFound();
  }

  // Retrieve the order details from PostgreSQL
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans relative">
      <SuccessClient />

      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-900/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-900/5 blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* Main Panel */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 sm:py-24 z-10 flex flex-col justify-center">
        
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-zinc-800/80 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-emerald-500 to-indigo-500"></div>

          {/* Success Check Badge */}
          <div className="text-center space-y-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/40 text-emerald-400 text-3xl border border-emerald-900/50 animate-bounce">
              ✓
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Order Confirmed & Placed!
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Thank you for shopping with E Shop. Your transaction has been registered and is being routed to our edge fulfillment centers.
            </p>
          </div>

          {/* Order Metadata Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-550 block">Order ID Reference</span>
              <span className="text-xs font-mono font-bold text-zinc-205">{order.id}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-550 block">Fulfillment Channel</span>
              <span className="text-xs font-extrabold text-indigo-400">
                {order.paymentMethod === "STRIPE" ? "💳 Secured Credit Card (PAID)" : order.paymentMethod === "BKASH" ? "📢 bKash Wallet (PAID)" : "📝 Cash on Delivery (COD)"}
              </span>
            </div>
            <div className="space-y-1 sm:col-span-2 pt-2 border-t border-zinc-900">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-550 block">Delivery Address</span>
              <span className="text-xs text-zinc-300 font-medium leading-relaxed block">
                {order.address}
              </span>
            </div>
          </div>

          {/* Receipt Itemization */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 border-b border-zinc-900 pb-2">
              Invoice Receipt
            </h3>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs font-medium">
                  <div className="text-zinc-400 flex items-center gap-1.5 min-w-0">
                    <span className="truncate max-w-[200px] text-zinc-300 font-bold">{item.product?.name || "Product Item"}</span>
                    <span className="text-zinc-550">x {item.qty}</span>
                  </div>
                  <span className="font-bold text-white shrink-0">
                    ${(item.priceAtPurchase * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between text-xs font-bold border-t border-zinc-900 pt-4 text-zinc-400">
                <span>Shipping & Freight</span>
                <span className="text-emerald-450 uppercase text-[9px] tracking-wider bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                  Free Promo
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-white font-extrabold border-t border-zinc-900 pt-4">
                <span>Grand Total Paid</span>
                <span className="text-indigo-400 text-base">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout CTA Routing Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg text-xs text-center border border-zinc-200/20"
            >
              Continue Shopping
            </Link>
            <Link 
              href="/#roadmap"
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 text-zinc-300 font-bold px-6 py-3 rounded-xl transition-all text-xs text-center"
            >
              System Roadmap Console
            </Link>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-550 z-10">
        © 2026 E Shop. Secure Edge Webhooks Verification.
      </footer>

    </div>
  );
}
