"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/admin";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  categoryId: string;
  images: string[];
  isActive: boolean;
}

interface Props {
  product: Product;
  categories: Category[];
}

export default function EditProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form Fields pre-filled with database product parameters
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [image, setImage] = useState(product.images[0] || "");
  const [useUpload, setUseUpload] = useState(
    !product.images[0] || product.images[0].startsWith("data:image") || product.images[0].startsWith("http")
  );
  const [isActive, setIsActive] = useState(product.isActive);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError("File size is too large! Maximum limit is 20MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    formData.append("existingImages", JSON.stringify(product.images));

    startTransition(async () => {
      const res = await updateProduct(product.id, null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        
        // Redirect back after a quick delay
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
          <label htmlFor="edit-name" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Product Name *
          </label>
          <input
            id="edit-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="edit-price" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Price ($ USD) *
          </label>
          <input
            id="edit-price"
            type="number"
            step="0.01"
            required
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="edit-stock" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Units Stock *
          </label>
          <input
            id="edit-stock"
            type="number"
            required
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Category select */}
        <div>
          <label htmlFor="edit-category" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Catalog Category *
          </label>
          <select
            id="edit-category"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image / Emoji */}
        <div className="flex flex-col justify-end">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            {useUpload ? "Thumbnail Image Photo *" : "Thumbnail Image Emoji / URL *"}
          </label>
          
          {useUpload ? (
            <div className="w-full bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-indigo-500/40 transition-colors cursor-pointer relative min-h-[92px]">
              {image && (image.startsWith("data:image") || image.startsWith("http")) ? (
                <div className="relative group w-full flex items-center justify-center overflow-hidden py-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="Uploaded product preview" className="max-h-[72px] rounded-lg object-contain" />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute top-0 right-0 bg-red-950/80 hover:bg-red-900 border border-red-900/60 text-red-400 text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-1">
                  <span className="text-xl mb-0.5">📷</span>
                  <span className="text-[11px] font-bold text-zinc-300">Choose Product Photo</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">PNG, JPG, JPEG, or WEBP up to 20MB</span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <input
              id="edit-image"
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="e.g. ⌚ or standard URL link"
              disabled={isPending}
              className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setUseUpload(!useUpload);
              setImage(useUpload ? "📦" : "");
            }}
            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold mt-2 hover:underline self-start cursor-pointer"
          >
            {useUpload ? "Or use emoji/direct URL link instead" : "Or upload a product photo instead"}
          </button>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="edit-desc" className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            Description details *
          </label>
          <textarea
            id="edit-desc"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 resize-y"
          />
        </div>

        {/* Active Toggle */}
        <div className="sm:col-span-2 flex items-center gap-3 py-2">
          <input
            id="edit-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
            className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-500 cursor-pointer disabled:opacity-50"
          />
          <label htmlFor="edit-active" className="text-xs font-semibold text-zinc-300 cursor-pointer select-none">
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
          ✅ {success} Saving changes and redirecting...
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all border border-indigo-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Saving changes...
            </>
          ) : (
            "Save Changes"
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
