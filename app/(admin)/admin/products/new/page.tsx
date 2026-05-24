import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import NewProductForm from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

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
        <h1 className="text-3xl font-extrabold tracking-tight">Create Listing</h1>
        <p className="text-zinc-400 text-sm mt-1">Publish a new premium product listing to the customer storefront.</p>
      </div>

      {/* Glass form card */}
      <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <NewProductForm categories={categories} />
      </div>

    </div>
  );
}
