import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout | Secure AG.ESHOP Funnel",
  description: "Secure invoice checkout funnel for e-shop premium orders.",
};

export default async function CheckoutPage() {
  const session = await auth();

  // Guard routing server-side
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return <CheckoutClient userEmail={session.user.email || ""} userName={session.user.name || "Customer"} />;
}
