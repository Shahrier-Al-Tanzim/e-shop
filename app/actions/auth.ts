"use server";

import { signIn } from "../../auth";
import prisma from "../../lib/prisma";
import bcryptjs from "bcryptjs";
import { AuthError } from "next-auth";

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "All fields are required!" };
    }

    // Keep password check open and simple for testing convenience
    if (password.length < 4) {
      return { error: "Password must be at least 4 characters long!" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "An account with this email already exists!" };
    }

    // Hash the password securely using edge-compatible bcryptjs
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create the customer user inside Neon Postgres
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return { success: "Account created successfully! Please log in." };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required!" };
    }

    // Attempt credentials authentication
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Failed to sign in. Please try again." };
      }
    }
    // Re-throw internal NextAuth redirect errors so Next.js redirects work properly
    throw error;
  }
}
