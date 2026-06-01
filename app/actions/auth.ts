"use server";

import { signIn } from "../../auth";
import prisma from "../../lib/prisma";
import bcryptjs from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters long!"),
  email: z.string().email("Please provide a valid email address!"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long!")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter!")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter!")
    .regex(/[0-9]/, "Password must contain at least 1 numerical digit!")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character!"),
});

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "All fields are required!" };
    }

    // Server-side Zod validation
    const validationResult = registerSchema.safeParse({ name, email, password });
    if (!validationResult.success) {
      return { error: validationResult.error.issues[0].message };
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
