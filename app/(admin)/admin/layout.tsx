import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = {
  title: "Admin Dashboard | AG.ESHOP Console",
  description: "Secure operational control panel for e-shop administrators.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Enforce server-side security check (double guarding `/admin/*`)
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans relative">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-950/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-950/10 blur-[120px] pointer-events-none"></div>

      {/* Admin Navbar */}
      <header className="glass-navbar sticky top-0 z-40 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              AG.CONSOLE
            </span>
            <span className="text-[9px] uppercase tracking-widest bg-indigo-950 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded-full font-bold">
              Secure Admin
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-400 hidden sm:inline">
              Logged in as: <strong className="text-zinc-200">{session.user.name || "Administrator"}</strong>
            </span>
            <Link 
              href="/" 
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold transition-all hover:scale-[1.02]"
            >
              ← Go to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Layout Shell */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-6 py-8 md:py-12 gap-8 z-10">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1 shadow-xl">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-3 mb-3">
              Navigation Menu
            </h3>
            
            <Link 
              href="/admin" 
              className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl hover:bg-zinc-800/50 hover:text-indigo-400 text-zinc-300 transition-all font-semibold"
            >
              <span>📊</span> Console Overview
            </Link>
            
            <Link 
              href="/admin/products" 
              className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl hover:bg-zinc-800/50 hover:text-indigo-400 text-zinc-300 transition-all font-semibold"
            >
              <span>📦</span> Product Catalog
            </Link>
            
            <Link 
              href="/admin/categories" 
              className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl hover:bg-zinc-800/50 hover:text-indigo-400 text-zinc-300 transition-all font-semibold"
            >
              <span>🏷️</span> Category Manager
            </Link>
            
            <Link 
              href="/admin/orders" 
              className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl hover:bg-zinc-800/50 hover:text-indigo-400 text-zinc-300 transition-all font-semibold"
            >
              <span>💳</span> Customer Orders
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-2xl shadow-xl hidden md:flex flex-col gap-2 border border-indigo-950/20 bg-indigo-950/5">
            <h4 className="text-xs font-bold text-indigo-400">🛡️ Guard Active</h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Session is edge-shielded. Database connection is persisting globally via serverless Neon pool variables.
            </p>
          </div>
        </aside>

        {/* Content Console */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

    </div>
  );
}
