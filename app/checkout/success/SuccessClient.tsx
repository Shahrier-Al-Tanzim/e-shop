"use client";

import React, { useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";

export default function SuccessClient() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Purge the client-side Zustand store upon loading the payment success landing page
    clearCart();
  }, [clearCart]);

  return null;
}
