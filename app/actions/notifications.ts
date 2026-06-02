"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Creates a notification in the database.
 * Internal server-side helper.
 */
export async function createNotification(
  title: string,
  message: string,
  userId: string | null = null,
  isAdmin: boolean = false
) {
  try {
    const data: any = {
      title,
      message,
      isAdmin,
    };
    if (userId) {
      data.userId = userId;
    }

    const notification = await prisma.notification.create({ data });
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/notifications");
    return { success: true, notification };
  } catch (error: any) {
    console.error("Failed to create notification:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch notifications list for the logged-in user or admins.
 */
export async function getNotifications(isAdmin: boolean = false) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized access." };
    }

    // Verify Admin rights if requested
    if (isAdmin && session.user.role !== "ADMIN") {
      return { success: false, error: "Access denied. Admins only." };
    }

    const notifications = await prisma.notification.findMany({
      where: isAdmin
        ? { isAdmin: true }
        : { userId: session.user.id, isAdmin: false },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, notifications };
  } catch (error: any) {
    console.error("Failed to get notifications:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieve count of unread notifications for logged in user or admin.
 */
export async function getUnreadCount(isAdmin: boolean = false) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: true, count: 0 };
    }

    if (isAdmin && session.user.role !== "ADMIN") {
      return { success: true, count: 0 };
    }

    const count = await prisma.notification.count({
      where: {
        isRead: false,
        ...(isAdmin ? { isAdmin: true } : { userId: session.user.id, isAdmin: false }),
      },
    });

    return { success: true, count };
  } catch (error: any) {
    console.error("Failed to get unread notification count:", error);
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(notificationId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized access." };
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "Notification not found." };
    }

    // Ensure user owns notification or is an admin updating admin notification
    if (notification.isAdmin) {
      if (session.user.role !== "ADMIN") {
        return { success: false, error: "Access denied." };
      }
    } else {
      if (notification.userId !== session.user.id) {
        return { success: false, error: "Access denied." };
      }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Marks all notifications as read for current user/admin.
 */
export async function markAllAsRead(isAdmin: boolean = false) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized access." };
    }

    if (isAdmin && session.user.role !== "ADMIN") {
      return { success: false, error: "Access denied." };
    }

    await prisma.notification.updateMany({
      where: {
        isRead: false,
        ...(isAdmin ? { isAdmin: true } : { userId: session.user.id, isAdmin: false }),
      },
      data: { isRead: true },
    });

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/admin");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error: error.message };
  }
}
