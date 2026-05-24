"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    toggleDrawer,
    removeItem,
    updateQty,
    getCartTotal,
    getCartCount,
  } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);

  // Prevent Next.js hydration discrepancies by rendering only client-side after mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isDrawerOpen) return null;

  const totalAmount = getCartTotal();
  const totalCount = getCartCount();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in" 
        onClick={() => toggleDrawer(false)}
      ></div>

      {/* Drawer Panel Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md glass-panel flex flex-col h-full shadow-2xl animate-slide-in border-l border-zinc-800/80">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2 select-none">
              Shopping Cart <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{totalCount} items</span>
            </h2>
            <button 
              onClick={() => toggleDrawer(false)}
              className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:scale-102 transition-all text-xs cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Items Lists */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
                <span className="text-4xl mb-4 select-none animate-bounce">🛒</span>
                <p className="font-extrabold text-zinc-400">Your cart is empty</p>
                <p className="text-xs mt-1 text-zinc-500 max-w-xs mx-auto">
                  Browse our active catalog listings to add premium items to your collection.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-900/80 p-3 rounded-2xl hover:border-zinc-800 transition-colors">
                  
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-zinc-900">
                    {item.image.startsWith("http") || item.image.startsWith("data:image") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.image
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-zinc-100 truncate">{item.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">${item.price.toFixed(2)} each</p>
                    
                    {/* Quantity selectors */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-5 h-5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white flex items-center justify-center text-xs cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold text-zinc-200 select-none min-w-[12px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                        className={`w-5 h-5 rounded bg-zinc-950 border text-xs flex items-center justify-center cursor-pointer font-bold ${
                          item.qty >= item.stock
                            ? "border-zinc-900 text-zinc-600 cursor-not-allowed"
                            : "border-zinc-850 text-zinc-400 hover:text-white"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total and Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-extrabold text-xs text-white">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer font-bold px-1"
                    >
                      Remove
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 space-y-4">
              
              <div className="flex items-center justify-between font-extrabold text-white text-sm">
                <span className="text-zinc-400">Order Subtotal</span>
                <span className="text-lg text-indigo-400">${totalAmount.toFixed(2)}</span>
              </div>
              
              <p className="text-[9px] text-zinc-500 leading-relaxed">
                * Zustand global store state synchronized dynamically. Stripe hosted checkout session and Webhooks checkout fulfillment will plug in during Module 7.
              </p>
              
              <button 
                onClick={() => alert("Checkout pipeline will connect dynamically in Module 7!")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all border border-indigo-500/30 cursor-pointer text-xs flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                🔒 Proceed to Checkout
              </button>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
