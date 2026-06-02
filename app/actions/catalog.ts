"use server";

import prisma from "@/lib/prisma";

/**
 * Fetch a single active product by its unique URL slug.
 * Returns null if the product does not exist or is inactive.
 */
export async function getActiveProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Protect catalog by only returning active listings to customers
    if (!product || !product.isActive) {
      return null;
    }

    return product;
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return null;
  }
}
