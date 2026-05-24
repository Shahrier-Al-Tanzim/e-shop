import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { deleteProduct } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function ProductsListPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage e-shop store listings, pricing, and active inventory stock.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-indigo-500/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          ➕ Add New Product
        </Link>
      </div>

      {/* Catalog Table Card */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl">
        {products.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <span className="text-4xl">📦</span>
            <p className="font-semibold text-zinc-400 mt-3">No products available</p>
            <p className="text-xs mt-1">Click the "Add New Product" button above to publish your first item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-bold">
                  <th className="py-3 pl-2">Item</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Stock Status</th>
                  <th className="py-3">Visibility</th>
                  <th className="py-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors group">
                    
                    {/* Item details */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-xl shrink-0">
                          {product.images[0]?.startsWith("http") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            product.images[0] || "📦"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-200 text-sm group-hover:text-indigo-400 transition-colors truncate">
                            {product.name}
                          </div>
                          <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5 max-w-[180px]">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4">
                      <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 font-bold text-white text-sm">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Stock Status */}
                    <td className="py-4">
                      {product.stock === 0 ? (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-red-950/40 text-red-400 border border-red-900/40">
                          Out of stock
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-amber-950/40 text-amber-400 border border-amber-900/40 animate-pulse">
                          Low Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
                          {product.stock} in stock
                        </span>
                      )}
                    </td>

                    {/* Visibility */}
                    <td className="py-4">
                      {product.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Hidden
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-400 border border-zinc-800 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          ✎ Edit
                        </Link>
                        
                        <form action={async () => {
                          "use server";
                          await deleteProduct(product.id);
                        }}>
                          <button
                            type="submit"
                            className="text-xs font-bold bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-900/30 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            ✕ Delete
                          </button>
                        </form>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
