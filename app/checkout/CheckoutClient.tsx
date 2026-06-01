"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import { createCodOrder, createStripeSession } from "@/app/actions/checkout";

interface CheckoutClientProps {
  userEmail: string;
  userName: string;
  defaultAddress: string;
  defaultPhone: string;
}

export default function CheckoutClient({ 
  userEmail, 
  userName,
  defaultAddress,
  defaultPhone
}: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart, getCartTotal } = useCartStore();

  const [address, setAddress] = useState(defaultAddress);
  const [phone, setPhone] = useState(defaultPhone);
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "COD">("STRIPE");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Sync search errors if any (e.g. cancelled payment)
  useEffect(() => {
    setIsMounted(true);
    const err = searchParams.get("error");
    if (err === "payment_cancelled") {
      setErrorMsg("Your card transaction was cancelled. You can choose COD or try again.");
    }
  }, [searchParams]);

  if (!isMounted) return null;

  const totalAmount = getCartTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!address.trim() || !phone.trim()) {
      setErrorMsg("Please fill in both your Delivery Address and Phone Number.");
      return;
    }

    if (items.length === 0) {
      setErrorMsg("Your cart is empty. Return to the catalog to add premium items.");
      return;
    }

    setIsLoading(true);

    if (paymentMethod === "STRIPE") {
      setLoadingMessage("Negotiating secure payment gateway tunnels with Stripe...");
      const res = await createStripeSession(address, phone, items);
      if (res.success && res.url) {
        // Redirect to Stripe Hosted Checkout
        window.location.href = res.url;
      } else {
        setErrorMsg(res.error || "Failed to create Stripe payment session.");
        setIsLoading(false);
      }
    } else {
      setLoadingMessage("Placing your Cash on Delivery order in our database...");
      const res = await createCodOrder(address, phone, items);
      if (res.success && res.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${res.orderId}`);
      } else {
        setErrorMsg(res.error || "Failed to place COD order.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans relative">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* Glassmorphic Navbar */}
      <nav className="glass-navbar sticky top-0 z-40 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              E Shop
            </Link>
            <span className="text-[10px] uppercase tracking-widest bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700 font-bold">
              Secure
            </span>
          </div>
          <div className="text-xs text-zinc-400 font-medium">
            Customer: <strong className="text-zinc-200">{userName}</strong> ({userEmail})
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 z-10 flex flex-col">
        
        {/* Back link */}
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-indigo-400 transition-all flex items-center gap-1.5">
            ← Back to Storefront Catalog
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mb-8">
          🔒 Secure Order Checkout
        </h1>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 glass-panel rounded-3xl p-8 border border-zinc-800">
            <span className="text-5xl mb-6 select-none animate-bounce">🛒</span>
            <h2 className="text-xl font-extrabold text-zinc-300">Your shopping cart is empty</h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
              Please browse our premium database listings to select high-end items before entering the checkout funnel.
            </p>
            <Link 
              href="/"
              className="mt-8 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-102 text-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Checkout Form Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {errorMsg && (
                <div className="p-4 bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <span>⚠️</span> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-zinc-800/80 space-y-6 shadow-2xl">
                <h3 className="text-sm uppercase font-extrabold tracking-widest text-zinc-400 border-b border-zinc-900 pb-3">
                  1. Delivery Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete home/business street address details..."
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-850 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/85 font-medium placeholder-zinc-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Contact Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full bg-zinc-950 border border-zinc-850 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/85 font-medium placeholder-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <h3 className="text-sm uppercase font-extrabold tracking-widest text-zinc-400 border-b border-zinc-900 pb-3 pt-4">
                  2. Select Payment Channel
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Stripe Card Selection */}
                  <label 
                    className={`flex flex-col p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      paymentMethod === "STRIPE"
                        ? "bg-indigo-950/20 border-indigo-550/80 text-white shadow-lg shadow-indigo-500/5"
                        : "bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "STRIPE"}
                          onChange={() => setPaymentMethod("STRIPE")}
                          className="text-indigo-550"
                        />
                        💳 Secure Credit Card
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                      Instant verification via Stripe. Secure 3D authentication checkpoints.
                    </span>
                  </label>

                  {/* Cash on Delivery Selection */}
                  <label 
                    className={`flex flex-col p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      paymentMethod === "COD"
                        ? "bg-indigo-950/20 border-indigo-550/80 text-white shadow-lg shadow-indigo-500/5"
                        : "bg-zinc-900/30 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "COD"}
                          onChange={() => setPaymentMethod("COD")}
                          className="text-indigo-550"
                        />
                        📦 Cash on Delivery
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                      Pay cash on arrival. Immediate order placement, database stock subtracted.
                    </span>
                  </label>

                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-black py-4.5 rounded-2xl transition-all shadow-lg hover:scale-[1.01] cursor-pointer text-sm flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed border border-zinc-200/20"
                  >
                    {paymentMethod === "STRIPE" ? "🔒 Proceed to Stripe Gateway" : "📝 Place COD Transaction"}
                  </button>
                </div>
              </form>

            </div>

            {/* Right: Checkout Summary */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="glass-panel p-6 rounded-3xl border border-zinc-800/80 shadow-2xl flex flex-col gap-6">
                <h3 className="text-sm uppercase font-extrabold tracking-widest text-zinc-400 border-b border-zinc-900 pb-3">
                  Order Summary
                </h3>

                {/* Cart list items */}
                <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3.5 bg-zinc-900/40 border border-zinc-900/80 p-2.5 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-xl overflow-hidden shrink-0 border border-zinc-900">
                        {item.image.startsWith("http") || item.image.startsWith("data:image") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          item.image
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-zinc-200 truncate">{item.name}</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">${item.price.toFixed(2)} x {item.qty}</p>
                      </div>
                      <span className="font-extrabold text-[11px] text-white shrink-0">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals invoice */}
                <div className="border-t border-zinc-900 pt-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-200">${totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Shipping Charges</span>
                    <span className="font-extrabold text-emerald-450 uppercase text-[10px] tracking-wider bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                      Free Standard
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white font-extrabold border-t border-zinc-900 pt-4">
                    <span>Order Total</span>
                    <span className="text-indigo-400 text-base">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
          <h3 className="text-base font-extrabold text-zinc-100 uppercase tracking-wider animate-pulse">
            Processing Checkout Funnel
          </h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-sm">
            {loadingMessage}
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-550 z-10">
        © 2026 E Shop. Secure Vercel Edge Serverless Routing.
      </footer>

    </div>
  );
}
