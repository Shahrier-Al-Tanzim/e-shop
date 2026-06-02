"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/lib/store/useCartStore";
import CartDrawer from "@/components/CartDrawer";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  reviewsCount?: number;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface HomeClientProps {
  initialProducts: Product[];
}

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // UI Interactive States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hi there! I am your AI E Shop Assistant. I will be fully integrated with function tools in Module 9. Ask me anything about our tech stack, Vercel deployments, or roadmap!",
      timestamp: "03:00 AM"
    }
  ]);
  const [userInput, setUserInput] = useState("");

  // Hydration Mount Safety Safeguard
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hook E Shop store selectors and triggers
  const addItem = useCartStore((state) => state.addItem);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = useCartStore((state) => state.getCartCount());

  // Search & Category Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dynamically extract active category filter chips from products list
  const uniqueCategories = ["All", ...Array.from(new Set(initialProducts.map(p => p.category)))];

  // Perform multi-dimensional client-side queries
  const filteredProducts = initialProducts.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Simulated AI responses
  const getSimulatedAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("stack") || q.includes("technology") || q.includes("framework")) {
      return "We are building on Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Neon PostgreSQL with Prisma ORM, Auth.js v5 for security, Cloudinary for images, and Stripe for payments!";
    }
    if (q.includes("vercel") || q.includes("deploy") || q.includes("production")) {
      return "Yes! The entire architecture is designed stateless and runs optimized on the Edge. Neon Postgres autoscales serverless, and Stripe hooks run event-driven, making the application 100% Vercel-ready with zero connection bottlenecks.";
    }
    if (q.includes("roadmap") || q.includes("module") || q.includes("next")) {
      return "Next up is Module 2, where we will configure Neon PostgreSQL and write our core Prisma Schema. After that, we proceed with Auth.js (Module 3) and Admin CRUD panel (Module 4).";
    }
    if (q.includes("cart") || q.includes("buy") || q.includes("purchase")) {
      return "You can add items to your cart by clicking the 'Add to Cart' button on the cards. Cart state is managed client-side using Zustand and will sync with Neon DB in later modules!";
    }
    return "That's a great question! During Module 9, I will be wired up to a live Gemini or Claude model and will have tool-calling access to query the PostgreSQL database directly for inventory or order updates.";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");

    // Simulate reply after 600ms
    setTimeout(() => {
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: getSimulatedAIResponse(userMsg.text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toggleDrawer(true); // Open the uploader drawer reactively!
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans relative">

      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* Glassmorphic Navbar */}
      <nav className="glass-navbar sticky top-0 z-40 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              E Shop
            </Link>
            <span className="text-[10px] uppercase tracking-widest bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
              v1.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
            <a href="#store" className="hover:text-indigo-400 transition-colors">Catalog</a>
            <span className="text-zinc-700">|</span>
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Vercel Ready
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleDrawer(true)}
              className="relative p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 transition-all group cursor-pointer"
            >
              🛒
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-medium hidden md:inline-flex items-center gap-1.5">
                  Hi, {session?.user?.name || "Customer"}
                  {session?.user?.role === "ADMIN" && (
                    <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold">
                      Admin
                    </span>
                  )}
                </span>

                {session?.user?.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition-colors border border-indigo-500/30 cursor-pointer"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="inline-flex text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3.5 py-2 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                  >
                    Profile & Orders
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer px-2 py-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors border border-indigo-500/30 cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 z-10 w-full">

        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-10 flex flex-col items-center">
          <p className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            <span className="premium-gradient-text">E shop</span>
          </p>
          <p className="text-zinc-400 text-xs sm:text-sm mb-5 max-w-lg leading-relaxed">
            A premium template designed for extreme performance, security, and edge deployments. Scalable to millions of views with Neon serverless PostgreSQL, Stripe Checkout, and a fully cognitive AI Support Assistant.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#store"
              className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg hover:shadow-zinc-200/10 hover:scale-[1.02]"
            >
              Browse Catalog
            </a>
          </div>
        </section>



        {/* Store Catalog Section */}
        <section id="store" className="scroll-mt-24 mb-20">
          {/* Search Bar and Category Chips Panel */}
          <div className="glass-panel p-6 rounded-2xl mb-10 space-y-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

              {/* Search Box */}
              <div className="md:col-span-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title, crafted details, or categories..."
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-xs rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs font-bold"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Reset Button */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-lg">
                  {filteredProducts.length} Listings Matching
                </span>
              </div>

            </div>

            {/* Category selection tags */}
            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-zinc-900">
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] uppercase font-black tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer border ${selectedCategory === cat
                      ? "bg-zinc-50 border-zinc-200 text-zinc-950 font-bold scale-[1.01]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 text-center text-zinc-500 shadow-xl">
              <span className="text-5xl">📦</span>
              <p className="font-semibold text-zinc-400 text-lg mt-4">No active catalog items found</p>
              <p className="text-sm mt-1 max-w-md mx-auto">
                No listings match your search or filter options. Try adjusting filters or resetting search input parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="glass-panel rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-indigo-500/40 transition-all duration-300 flex flex-col group h-full shadow-lg">

                  {/* Product Image Panel */}
                  <Link href={`/products/${product.slug}`} className="cursor-pointer block relative select-none overflow-hidden h-48 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-center text-6xl">
                    {product.image.startsWith("http") || product.image.startsWith("data:image") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      product.image
                    )}

                    {product.stock === 0 && (
                      <span className="absolute top-3 left-3 bg-red-950 text-red-400 text-[10px] font-extrabold border border-red-900/60 px-2 py-0.5 rounded-md z-10">
                        Out of Stock
                      </span>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="absolute top-3 left-3 bg-amber-950 text-amber-400 text-[10px] font-extrabold border border-amber-900/60 px-2 py-0.5 rounded-md z-10">
                        Low Stock ({product.stock})
                      </span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                        {product.category}
                      </span>

                      <Link href={`/products/${product.slug}`} className="cursor-pointer block">
                        <h3 className="font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors truncate">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 mt-2">
                        {product.rating > 0 ? (
                          <>
                            <span className="text-xs text-amber-400">★</span>
                            <span className="text-xs text-zinc-300 font-semibold">{product.rating}</span>
                            {product.reviewsCount !== undefined && product.reviewsCount > 0 && (
                              <span className="text-xs text-zinc-500">({product.reviewsCount})</span>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-bold">No reviews yet</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-zinc-900">
                      <span className="font-extrabold text-white text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                      {session?.user?.role === "ADMIN" ? (
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-xs px-3.5 py-2 rounded-lg font-bold border bg-indigo-650 hover:bg-indigo-500 text-white border-indigo-500/30 cursor-pointer shadow-sm transition-all"
                        >
                          Edit Product
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className={`text-xs px-3.5 py-2 rounded-lg font-bold border transition-all ${product.stock === 0
                              ? "bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed"
                              : "bg-zinc-50 text-zinc-950 hover:bg-zinc-200 border-zinc-300 cursor-pointer shadow-sm"
                            }`}
                        >
                          {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-12 text-center text-sm text-zinc-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 E Shop. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Next.js 16</a>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Tailwind v4</a>
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Vercel Deploy</a>
          </div>
        </div>
      </footer>

      {/* Global Shopping Cart Sidebar Panel */}
      <CartDrawer />

      {/* Floating AI Chat Assistant Drawer */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">

        {/* Chat Toggle Button (Disabled for now) */}
        {/* <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all glow-indigo cursor-pointer text-2xl border border-indigo-400/30"
        >
          {isChatOpen ? "✕" : "🤖"}
        </button> */}

        {/* Chat Window Panel */}
        {isChatOpen && (
          <div className="w-[340px] sm:w-[380px] h-[450px] glass-panel rounded-2xl shadow-2xl mt-4 border border-zinc-800 flex flex-col overflow-hidden animate-fade-in">

            {/* Window Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-950/80 to-violet-950/80 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <div>
                  <h3 className="text-xs font-extrabold tracking-wide uppercase text-white">AI Support Bot</h3>
                  <p className="text-[9px] text-zinc-400">Module 9 cognitive assistant stub</p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono">
                SIMULATION
              </span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-zinc-950/50">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs flex flex-col ${msg.sender === "assistant"
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-200 self-start"
                      : "bg-indigo-600 text-white self-end"
                    }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className={`text-[8px] mt-1 select-none self-end ${msg.sender === "assistant" ? "text-zinc-500" : "text-indigo-300"
                    }`}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-800 bg-zinc-900/90 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Ask about stack, vercel, roadmap..."
                className="flex-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
