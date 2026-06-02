import React from "react";
import prisma from "@/lib/prisma";
import AdminNotificationsClient from "./AdminNotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    where: { isAdmin: true },
    orderBy: { createdAt: "desc" },
  });

  return <AdminNotificationsClient initialNotifications={notifications} />;
}
