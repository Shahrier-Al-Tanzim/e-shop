import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  // Query product and categories on the server
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      
      {/* Back link */}
      <div>
        <Link 
          href="/admin/products" 
          className="text-xs font-bold text-zinc-400 hover:text-indigo-400 transition-colors"
        >
          ← Back to Catalog
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Listing</h1>
        <p className="text-zinc-400 text-sm mt-1">Modify active product details, adjust pricing, or restock item quantities.</p>
      </div>

      {/* Glass card form */}
      <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl"></div>
        <EditProductForm product={product} categories={categories} />
      </div>

    </div>
  );
}
