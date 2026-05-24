"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/admin";

interface Category {
  id: string;
  name: string;
}

export default function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("📦"); // Standard placeholder emoji
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !price || !stock || !description.trim() || !categoryId) {
      setError("Please fill out all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("image", image);
    formData.append("isActive", isActive ? "true" : "false");

    startTransition(async () => {
      const res = await createProduct(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        
        // Redirect to catalog after 1.5 seconds
        setTimeout(() => {
          router.push("/admin/products");
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 2-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Name */}
        <div className="sm:col-span-2">
          <label htmlFor="prod-name" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Product Name *
          </label>
          <input
            id="prod-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solitude Glass Chronograph"
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="prod-price" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Price ($ USD) *
          </label>
          <input
            id="prod-price"
            type="number"
            step="0.01"
            required
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 249.00"
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="prod-stock" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Units Stock *
          </label>
          <input
            id="prod-stock"
            type="number"
            required
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="e.g. 5"
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Category select */}
        <div>
          <label htmlFor="prod-category" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Catalog Category *
          </label>
          <select
            id="prod-category"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image / Emoji */}
        <div>
          <label htmlFor="prod-image" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Thumbnail Image / Emoji
          </label>
          <input
            id="prod-image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="e.g. ⌚ or standard URL link"
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="prod-desc" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Description details *
          </label>
          <textarea
            id="prod-desc"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product crafting details, dimensions, materials, and highlights..."
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 resize-y"
          />
        </div>

        {/* Active Toggle */}
        <div className="sm:col-span-2 flex items-center gap-3 py-2">
          <input
            id="prod-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
            className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-500 cursor-pointer disabled:opacity-50"
          />
          <label htmlFor="prod-active" className="text-xs font-semibold text-zinc-300 cursor-pointer select-none">
            Make this listing active and visible on public customer catalog shelves
          </label>
        </div>

      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 text-red-400 border border-red-900/50 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-xs font-semibold">
          ✅ {success} Redirecting back to catalog...
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all border border-indigo-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Saving listing...
            </>
          ) : (
            "Publish Product"
          )}
        </button>
        
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          disabled={isPending}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
