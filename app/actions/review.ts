"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number({ error: "Rating must be a number." }).int().min(1, "Rating must be at least 1 star.").max(5, "Rating cannot exceed 5 stars."),
  comment: z.string().min(3, "Feedback comment must be at least 3 characters long.").max(1000, "Feedback comment cannot exceed 1000 characters."),
  productId: z.string().min(1, "Product reference is required."),
});

export async function submitReview(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "You must be logged in to submit a review." };
    }

    const userId = session.user.id;
    const productId = formData.get("productId") as string;
    const ratingVal = parseInt(formData.get("rating") as string, 10);
    const comment = formData.get("comment") as string;
    
    // Parse review images (up to 3 files as base64 URLs)
    const imagesJson = formData.get("images") as string;
    let uploadedImages: string[] = [];
    if (imagesJson) {
      try {
        const rawImages = JSON.parse(imagesJson) as string[];
        // Upload each to Cloudinary
        for (const rawImg of rawImages) {
          if (rawImg && (rawImg.startsWith("data:image") || rawImg.startsWith("http"))) {
            const url = await uploadImage(rawImg);
            uploadedImages.push(url);
          }
        }
      } catch (err) {
        console.error("Failed to parse or upload review images:", err);
      }
    }

    // Zod validation
    const validation = reviewSchema.safeParse({
      rating: ratingVal,
      comment,
      productId,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Verify user has purchased this product and it has been delivered
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: "DELIVERED",
        },
      },
    });

    if (!orderItem) {
      return { error: "You can only review items that have been fully delivered." };
    }

    // Verify user has not already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      return { error: "You have already reviewed this product." };
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: ratingVal,
        comment,
        images: uploadedImages,
        userId,
        productId,
      },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    revalidatePath(`/products/${review.product.slug}`);
    revalidatePath("/profile");
    return { success: "Thank you! Your review has been published." };
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return { error: error.message || "Failed to publish your review. Please try again." };
  }
}
