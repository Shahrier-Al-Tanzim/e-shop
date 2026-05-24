import React from "react";
import prisma from "@/lib/prisma";
import { deleteCategory } from "@/app/actions/admin";
import CategoryForm from "./CategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Category Manager</h1>
          <p className="text-zinc-400 text-sm mt-1">Organize your shop structure and inventory catalog departments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <h2 className="font-extrabold text-lg text-white mb-6">Active Categories</h2>
            
            {categories.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <span className="text-3xl">🏷️</span>
                <p className="font-semibold text-zinc-400 mt-2">No categories found</p>
                <p className="text-xs mt-1">Register a category to start organizing products.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
                    <div>
                      <div className="font-bold text-zinc-200 text-sm">{category.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">slug: {category.slug}</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full">
                        {category._count.products} products
                      </span>
                      
                      <form action={async () => {
                        "use server";
                        await deleteCategory(category.id);
                      }}>
                        <button
                          type="submit"
                          disabled={category._count.products > 0}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                            category._count.products > 0
                              ? "bg-zinc-900/50 text-zinc-600 border-zinc-800/40 cursor-not-allowed"
                              : "bg-red-950/40 text-red-400 border-red-900/40 hover:bg-red-900/30 cursor-pointer"
                          }`}
                          title={category._count.products > 0 ? "Empty this category before deleting" : "Delete category"}
                        >
                          ✕ Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Add Category Form */}
        <div>
          <div className="glass-panel p-6 rounded-2xl shadow-xl sticky top-28">
            <h2 className="font-extrabold text-lg text-white mb-4">Add Category</h2>
            <p className="text-zinc-400 text-xs leading-relaxed mb-6">
              Create a new department. URL-friendly slugs will be auto-generated from your category name.
            </p>
            
            <CategoryForm />
          </div>
        </div>

      </div>

    </div>
  );
}
