"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

// Helper function to verify admin access
async function verifyAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Unauthorized! Administrator access required.");
  }
}

// Helper to generate a unique product slug
async function generateUniqueSlug(name: string, id?: string): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  if (!baseSlug) {
    baseSlug = "product";
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (id && existing.id === id)) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ------------------------------
// Product CRUD Server Actions
// ------------------------------

export async function createProduct(prevState: any, formData: FormData) {
  try {
    await verifyAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;
    const categoryId = formData.get("categoryId") as string;
    const isActive = formData.get("isActive") === "true";
    const imageInput = formData.get("image") as string; // Could be emoji or URL or base64

    if (!name || !description || !priceStr || !stockStr || !categoryId) {
      return { error: "All fields except image are required!" };
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);

    if (isNaN(price) || price < 0) {
      return { error: "Price must be a valid positive number!" };
    }

    if (isNaN(stock) || stock < 0) {
      return { error: "Stock must be a valid positive integer!" };
    }

    // Process image upload
    let finalImageUrl = "📦"; // Default placeholder emoji
    if (imageInput) {
      finalImageUrl = await uploadImage(imageInput);
    }

    const slug = await generateUniqueSlug(name);

    await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        stock,
        images: [finalImageUrl],
        categoryId,
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: "Product created successfully!" };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return { error: error.message || "Failed to create product. Please try again." };
  }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
  try {
    await verifyAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;
    const categoryId = formData.get("categoryId") as string;
    const isActive = formData.get("isActive") === "true";
    const imageInput = formData.get("image") as string;
    const existingImagesJson = formData.get("existingImages") as string;

    if (!name || !description || !priceStr || !stockStr || !categoryId) {
      return { error: "All fields except image are required!" };
    }

    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);

    if (isNaN(price) || price < 0) {
      return { error: "Price must be a valid positive number!" };
    }

    if (isNaN(stock) || stock < 0) {
      return { error: "Stock must be a valid positive integer!" };
    }

    let finalImages: string[] = [];
    if (existingImagesJson) {
      try {
        finalImages = JSON.parse(existingImagesJson);
      } catch {
        finalImages = [];
      }
    }

    // If new image supplied, upload and prepend/replace
    if (imageInput) {
      const uploadedUrl = await uploadImage(imageInput);
      finalImages = [uploadedUrl];
    }

    if (finalImages.length === 0) {
      finalImages = ["📦"];
    }

    const slug = await generateUniqueSlug(name, id);

    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        stock,
        images: finalImages,
        categoryId,
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    return { success: "Product updated successfully!" };
  } catch (error: any) {
    console.error("Failed to update product:", error);
    return { error: error.message || "Failed to update product. Please try again." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await verifyAdmin();

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: "Product deleted successfully!" };
  } catch (error: any) {
    console.error("Failed to delete product:", error);
    return { error: error.message || "Failed to delete product." };
  }
}

// ------------------------------
// Category CRUD Server Actions
// ------------------------------

export async function createCategory(prevState: any, formData: FormData) {
  try {
    await verifyAdmin();

    const name = formData.get("name") as string;
    if (!name || !name.trim()) {
      return { error: "Category name is required!" };
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return { error: "A category with this name or slug already exists!" };
    }

    await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products/new");
    return { success: `Category "${name}" created successfully!` };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { error: error.message || "Failed to create category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await verifyAdmin();

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return { error: `Cannot delete category! It contains ${productCount} active products.` };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: "Category deleted successfully!" };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { error: error.message || "Failed to delete category." };
  }
}

// ------------------------------
// Order Server Actions
// ------------------------------

export async function updateOrderStatus(orderId: string, status: any) {
  try {
    await verifyAdmin();

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: `Order status updated to ${status} successfully!` };
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { error: error.message || "Failed to update order status." };
  }
}
