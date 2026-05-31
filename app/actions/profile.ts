"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function updateCustomerProfile(address: string, phone: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: "You must be logged in to update settings." };
    }

    if (!address.trim() || !phone.trim()) {
      return { success: false, error: "Address and Phone number cannot be empty." };
    }

    // Update the default credentials on the User model
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        address: address.trim(),
        phone: phone.trim(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Profile settings update error:", error);
    return { success: false, error: error.message || "Failed to update default profile settings." };
  }
}
