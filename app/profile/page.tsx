import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "My Account Profile | AG.ESHOP",
  description: "View your order transactions history and fulfillment tracking status.",
};

export default async function ProfilePage() {
  const session = await auth();

  // Guard routing server-side
  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/profile");
  }

  // Fetch the logged-in customer's details and orders from PostgreSQL Neon database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <ProfileClient 
      userName={user.name || "Customer"} 
      userEmail={user.email || ""} 
      userRole={user.role}
      userCreatedAt={user.createdAt}
      defaultAddress={user.address || ""}
      defaultPhone={user.phone || ""}
      initialOrders={orders} 
    />
  );
}
