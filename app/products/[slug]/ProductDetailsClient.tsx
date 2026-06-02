"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/lib/store/useCartStore";
import CartDrawer from "@/components/CartDrawer";

interface Review {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date | string;
  user: {
    name: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: {
    name: string;
  };
  reviews?: Review[];
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface ClientProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
}

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Client States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "assistant",
      text: `Hi there! I am your E Shop Assistant. Do you have any questions about the ${product.name}? It belongs to our ${product.category?.name} department and is available for $${product.price.toFixed(2)}!`,
      timestamp: "03:00 AM"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Hydration Mount State
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Global Zustand Store Hooks
  const addItem = useCartStore((state) => state.addItem);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const cartCount = useCartStore((state) => state.getCartCount());

  // Compute average rating
  const reviewsCount = product.reviews?.length || 0;
  const averageRating = reviewsCount > 0
    ? parseFloat((product.reviews!.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1))
    : 0;

  // Compute rating breakdown count for each star rating (1 to 5)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (product.reviews) {
    product.reviews.forEach((r) => {
      const roundedRating = Math.round(r.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        starCounts[roundedRating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
  }

  // Map product to client-safe representation
  const clientProduct: ClientProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category?.name || "Uncategorized",
    image: product.images[0] || "📦",
    rating: averageRating > 0 ? averageRating : 5.0,
    stock: product.stock
  };

  const getSimulatedAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("stock") || q.includes("available") || q.includes("limit")) {
      return product.stock === 0
        ? `Unfortunately, the ${product.name} is currently out of stock. You can check back later as admins restock products regularly!`
        : `Yes! There are currently ${product.stock} units available in stock. Order yours soon before inventory runs out!`;
    }
    if (q.includes("price") || q.includes("cost") || q.includes("buy")) {
      return `The ${product.name} is listed at a premium price of $${product.price.toFixed(2)}. You can add it directly to your shopping cart using the 'Add to Cart' button on the page!`;
    }
    if (q.includes("desc") || q.includes("spec") || q.includes("material") || q.includes("about")) {
      return `The ${product.name} is highly-crafted: "${product.description}"`;
    }
    return `That's an excellent question! In Module 9, I will have real tool-calling credentials to query the PostgreSQL databases directly and fulfill personalized customer support inquiries. Let me know if you would like to know anything else about ${product.name}!`;
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

  const handleAddToCart = () => {
    addItem(clientProduct);
    toggleDrawer(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans relative">
      
      {/* Glow Backdrops */}
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
            <Link href="/#roadmap" className="hover:text-indigo-400 transition-colors">Roadmap</Link>
            <Link href="/#store" className="hover:text-indigo-400 transition-colors">Catalog</Link>
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
                    My Orders
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

      {/* Main Details Panel */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 md:py-20 z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-indigo-400 transition-all flex items-center gap-1.5">
            ← Back to Storefront Catalog
          </Link>
        </div>

        {/* 2-Column Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Left Column: Image Container with Smooth Slider & Thumbnails */}
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-8 rounded-3xl flex items-center justify-center min-h-[320px] md:min-h-[420px] shadow-2xl relative group overflow-hidden border border-zinc-800/80">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 pointer-events-none"></div>
              
              {/* Sliding viewport */}
              <div className="w-full h-[300px] overflow-hidden relative flex items-center justify-center">
                <div
                  className="flex transition-transform duration-500 ease-in-out w-full h-full"
                  style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                >
                  {(product.images && product.images.length > 0 ? product.images : ["📦"]).map((imgUrl, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center select-none text-[10rem]">
                      {imgUrl.startsWith("http") || imgUrl.startsWith("data:image") ? (
                        <img 
                          src={imgUrl} 
                          alt={`${product.name} - view ${idx + 1}`} 
                          className="max-h-[300px] object-contain rounded-xl drop-shadow-2xl group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <span className="drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                          {imgUrl}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Slider Controls */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-950/70 border border-zinc-800/60 hover:border-indigo-500 text-white flex items-center justify-center font-extrabold hover:bg-zinc-900 transition-all cursor-pointer select-none opacity-0 group-hover:opacity-100"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-950/70 border border-zinc-800/60 hover:border-indigo-500 text-white flex items-center justify-center font-extrabold hover:bg-zinc-900 transition-all cursor-pointer select-none opacity-0 group-hover:opacity-100"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Jumping Thumbnails Panel */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-3 py-1 flex-wrap">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl bg-zinc-950 border overflow-hidden transition-all duration-200 cursor-pointer p-1 shrink-0 ${
                      activeImageIndex === idx
                        ? "border-indigo-500 ring-2 ring-indigo-500/20 scale-105"
                        : "border-zinc-850 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {imgUrl.startsWith("http") || imgUrl.startsWith("data:image") ? (
                      <img src={imgUrl} alt="Thumbnail preview" className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <span className="text-xl flex items-center justify-center h-full">{imgUrl}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details Info */}
          <div className="space-y-6">
            
            {/* Category and Stock Indicator */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                {clientProduct.category}
              </span>
              
              {clientProduct.stock === 0 ? (
                <span className="px-3 py-0.5 rounded-full font-bold text-[9px] uppercase bg-red-950/40 text-red-400 border border-red-900/40">
                  Out of stock
                </span>
              ) : clientProduct.stock <= 5 ? (
                <span className="px-3 py-0.5 rounded-full font-bold text-[9px] uppercase bg-amber-950/40 text-amber-400 border border-amber-900/40 animate-pulse">
                  Low Stock ({clientProduct.stock} left)
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full font-bold text-[9px] uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
                  Active in stock
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {clientProduct.name}
            </h1>

            {/* Ratings Block */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(clientProduct.rating) ? "text-amber-400" : "text-zinc-700"}>
                    ★
                  </span>
                ))}
              </span>
              <span className="text-xs font-semibold text-zinc-400 ml-2">
                {reviewsCount > 0 ? `${clientProduct.rating} Rating (${reviewsCount} customer reviews)` : "No reviews yet"}
              </span>
            </div>

            {/* Pricing Block */}
            <div className="py-4 border-y border-zinc-900 flex items-center justify-between">
              <div>
                <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Retail Price</div>
                <div className="text-3xl font-black text-white mt-1">
                  ${clientProduct.price.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent uppercase tracking-wider font-extrabold flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Edge Guaranteed
                </span>
                <span className="text-[10px] text-zinc-500 block mt-1">No transactional cold starts</span>
              </div>
            </div>

            {/* Description Details */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-500">Specifications & Description</h3>
              <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Actions: Add to Cart */}
            <div className="pt-6 flex gap-4">
              {session?.user?.role === "ADMIN" ? (
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 font-bold py-4 px-6 rounded-2xl border transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.01] bg-indigo-650 hover:bg-indigo-500 text-white border-indigo-500/30 cursor-pointer shadow-lg hover:shadow-indigo-500/5"
                >
                  📝 Edit Product Detail
                </Link>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={clientProduct.stock === 0}
                  className={`flex-1 font-bold py-4 px-6 rounded-2xl border transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.01] ${
                    clientProduct.stock === 0
                      ? "bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed"
                      : "bg-zinc-50 text-zinc-950 hover:bg-zinc-200 border-zinc-300 cursor-pointer shadow-lg hover:shadow-zinc-50/5"
                  }`}
                >
                  {clientProduct.stock === 0 ? "Temporarily Unavailable" : "🛒 Add to Shopping Cart"}
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-zinc-900 pt-16">
          <div className="flex flex-col gap-1 mb-8">
            <h2 className="text-2xl font-black text-white">Customer Reviews</h2>
            <p className="text-xs text-zinc-500">Read verified buyer insights and community impressions.</p>
          </div>

          {reviewsCount > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl flex flex-col justify-center items-center text-center">
                <span className="text-5xl font-black text-white">{averageRating}</span>
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.round(averageRating) ? "text-amber-400" : "text-zinc-800"}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-zinc-500 mt-2">{reviewsCount} {reviewsCount === 1 ? 'rating' : 'ratings'} total</span>
              </div>
              <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl flex flex-col justify-center">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = starCounts[stars as 1 | 2 | 3 | 4 | 5] || 0;
                    const percentage = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 text-zinc-400 font-semibold flex items-center gap-0.5 justify-end select-none">
                          {stars} <span className="text-amber-400 text-[10px]">★</span>
                        </span>
                        <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-zinc-500 text-right font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!product.reviews || product.reviews.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center border border-zinc-900 shadow-xl">
              <span className="text-3xl mb-3 block select-none">💬</span>
              <h3 className="text-sm font-bold text-zinc-405">No Reviews Written Yet</h3>
              <p className="text-xs text-zinc-550 mt-1 max-w-xs mx-auto">
                Be the first to review this product after completing your invoice fulfillment!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="glass-panel p-6 rounded-2xl border border-zinc-900 shadow-xl flex flex-col justify-between">
                  <div>
                    {/* User & Rating */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-zinc-250 block">{rev.user.name || "Verified Customer"}</span>
                        <span className="text-[10px] text-zinc-550 block">
                          {new Date(rev.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-xs ${i < rev.rating ? "text-amber-400" : "text-zinc-800"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-xs text-zinc-400 mt-4 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Review photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2.5 mt-4 pt-4 border-t border-zinc-950">
                      {rev.images.map((imgUrl, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedReviewImage(imgUrl)}
                          className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer hover:border-indigo-500 transition-all active:scale-95 shrink-0"
                        >
                          <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Review Image Modal Overlay */}
      {selectedReviewImage && (
        <div
          onClick={() => setSelectedReviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl">
            <img src={selectedReviewImage} alt="Expanded review photo" className="object-contain max-h-[85vh] rounded-lg" />
            <button
              onClick={() => setSelectedReviewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-12 text-center text-sm text-zinc-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 E Shop. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors">Next.js 16 (ISR)</span>
            <span className="hover:text-white transition-colors">Tailwind v4</span>
            <span className="hover:text-white transition-colors">Neon Postgres</span>
          </div>
        </div>
      </footer>

      {/* Global Shopping Cart Sidebar Panel */}
      <CartDrawer />

      {/* Floating AI Chat Assistant Drawer */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        
        {/* Chat Toggle Button {Disabled for now} */}
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
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-xs flex flex-col ${
                    msg.sender === "assistant"
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-200 self-start"
                      : "bg-indigo-600 text-white self-end"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className={`text-[8px] mt-1 select-none self-end ${
                    msg.sender === "assistant" ? "text-zinc-500" : "text-indigo-300"
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
                placeholder="Ask about stock, pricing..."
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
