import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getActiveProductBySlug } from "@/app/actions/catalog";
import ProductDetailsClient from "./ProductDetailsClient";

// Incremental Static Regeneration: Revalidate static pages every 60 seconds
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-resolve all active product slugs at build time.
 * Yields sub-millisecond static page loads for clients.
 */
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Failed to generate static params for products:", error);
    return [];
  }
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;

  // Query database on the server
  const product = await getActiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
