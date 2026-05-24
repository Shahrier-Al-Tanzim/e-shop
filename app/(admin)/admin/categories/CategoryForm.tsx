"use client";

import React, { useState, useTransition } from "react";
import { createCategory } from "@/app/actions/admin";

export default function CategoryForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Category name cannot be empty!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    startTransition(async () => {
      const res = await createCategory(null, formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
        setName("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category-name" className="block text-xs uppercase font-bold tracking-widest text-zinc-500 mb-2">
          Category Name
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mechanical Keyboards"
          disabled={isPending}
          className="w-full bg-zinc-950 border border-zinc-800 text-sm rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 text-red-400 border border-red-900/50 text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-xs font-semibold">
          ✅ {success}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all border border-indigo-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Creating...
          </>
        ) : (
          "Save Category"
        )}
      </button>
    </form>
  );
}
