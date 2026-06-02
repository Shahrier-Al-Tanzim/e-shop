import React from "react";
import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Query all active products from Neon database including category mappings,
  // excluding the default hardcoded seed products.
  const products = await prisma.product.findMany({
    where: { 
      isActive: true,
      NOT: {
        slug: {
          in: [
            "solitude-glass-chronograph",
            "frosted-cybernetic-headphones",
            "indigo-glassmorphic-keycaps",
            "minimalist-leather-cardholder",
          ]
        }
      }
    },
    include: {
      category: {
        select: { name: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map products data to the format expected by our premium client component layout
  const mappedProducts = products.map((product) => {
    const reviewsCount = product.reviews?.length || 0;
    const averageRating = reviewsCount > 0
      ? parseFloat((product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
      : 0; // Set to 0 if no reviews exist

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category?.name || "Uncategorized",
      image: product.images[0] || "📦",
      rating: averageRating,
      stock: product.stock,
    };
  });

  return <HomeClient initialProducts={mappedProducts} />;
}
