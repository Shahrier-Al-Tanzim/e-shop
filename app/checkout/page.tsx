import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

import prisma from "@/lib/prisma";

export const metadata = {
  title: "Checkout | Secure E-Shop Funnel",
  description: "Secure invoice checkout funnel for e-shop premium orders.",
};

export default async function CheckoutPage() {
  const session = await auth();

  // Guard routing server-side
  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch the default delivery info from PostgreSQL User records
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <CheckoutClient 
      userEmail={session.user.email || ""} 
      userName={session.user.name || "Customer"} 
      defaultAddress={user?.address || ""}
      defaultPhone={user?.phone || ""}
    />
  );
}
