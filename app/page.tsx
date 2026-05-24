import React from "react";
import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Query all active products from Neon database including category mappings
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map products data to the format expected by our premium client component layout
  const mappedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category?.name || "Uncategorized",
    image: product.images[0] || "📦",
    rating: 4.8, // Fallback premium visual rating
    stock: product.stock,
  }));

  return <HomeClient initialProducts={mappedProducts} />;
}
