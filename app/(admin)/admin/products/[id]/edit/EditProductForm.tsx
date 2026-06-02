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
  const [images, setImages] = useState<string[]>(product.images || []);
  const [useUpload, setUseUpload] = useState(
    product.images && (product.images.length === 0 || product.images[0].startsWith("data:image") || product.images[0].startsWith("http"))
  );
  const [isActive, setIsActive] = useState(product.isActive);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 5 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        if (file.size > 20 * 1024 * 1024) {
          setError("File size is too large! Maximum limit is 20MB per image.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
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

    if (name.trim().length < 3) {
      setError("Product Name must be at least 3 characters long!");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters long!");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be greater than $0!");
      return;
    }

    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError("Stock cannot be negative!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("images", JSON.stringify(images));
    formData.append("isActive", isActive ? "true" : "false");

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
        <div className="sm:col-span-2">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">
            {useUpload ? `Product Images (${images.length}/5) *` : "Product Image Emoji / URL *"}
          </label>
          
          {useUpload ? (
            <div className="space-y-4">
              {images.length < 5 && (
                <div className="w-full bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500/40 transition-colors cursor-pointer relative min-h-[100px]">
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs font-bold text-zinc-300">Choose Product Photo(s)</span>
                    <span className="text-[10px] text-zinc-500 mt-1">Select up to 5 images (WEBP, PNG, JPG under 20MB)</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp"
                      multiple
                      onChange={handleFileChange}
                      disabled={isPending}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 aspect-square flex items-center justify-center">
                      {img.startsWith("data:image") || img.startsWith("http") ? (
                        <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{img}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 bg-red-950/80 hover:bg-red-900 border border-red-900/60 text-red-400 text-[10px] font-bold p-1 rounded-full cursor-pointer transition-colors w-6 h-6 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                id="edit-image"
                type="text"
                required
                value={images[0] || ""}
                onChange={(e) => setImages([e.target.value])}
                placeholder="e.g. ⌚ or standard URL link"
                disabled={isPending}
                className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setUseUpload(!useUpload);
              setImages(useUpload ? ["📦"] : []);
            }}
            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold mt-2.5 hover:underline self-start cursor-pointer"
          >
            {useUpload ? "Or use emoji/direct URL link instead" : "Or upload product photos instead"}
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
