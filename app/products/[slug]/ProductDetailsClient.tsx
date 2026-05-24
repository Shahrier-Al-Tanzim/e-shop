"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

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
      text: `Hi there! I am your E-Shop Assistant. Do you have any questions about the ${product.name}? It belongs to our ${product.category?.name} department and is available for $${product.price.toFixed(2)}!`,
      timestamp: "03:00 AM"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<{product: ClientProduct; qty: number}[]>([]);

  // Map product to client-safe representation
  const clientProduct: ClientProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category?.name || "Uncategorized",
    image: product.images[0] || "📦",
    rating: 4.8,
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
    if (clientProduct.stock === 0) return;
    setCartCount(prev => prev + 1);
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === clientProduct.id);
      if (existing) {
        return prev.map(item => item.product.id === clientProduct.id ? {...item, qty: item.qty + 1} : item);
      } else {
        return [...prev, { product: clientProduct, qty: 1 }];
      }
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0).toFixed(2);
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
              AG.ESHOP
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
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 transition-all group cursor-pointer"
            >
              🛒
              {cartCount > 0 && (
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
                  <span className="text-xs font-semibold bg-zinc-900 text-zinc-400 px-3.5 py-2 rounded-lg border border-zinc-800">
                    Customer
                  </span>
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
          
          {/* Left Column: Image Container */}
          <div className="glass-panel p-8 rounded-3xl flex items-center justify-center min-h-[320px] md:min-h-[420px] text-[10rem] select-none shadow-2xl relative group overflow-hidden border border-zinc-800/80">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 pointer-events-none"></div>
            {clientProduct.image.startsWith("http") || clientProduct.image.startsWith("data:image") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={clientProduct.image} 
                alt={clientProduct.name} 
                className="max-h-[300px] object-contain rounded-xl drop-shadow-2xl group-hover:scale-102 transition-transform duration-300"
              />
            ) : (
              <span className="drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                {clientProduct.image}
              </span>
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

            {/* Ratings Placeholder */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-amber-400">★ ★ ★ ★ ★</span>
              <span className="text-xs font-semibold text-zinc-400 ml-2">4.8 Rating (34 client reviews)</span>
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
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-12 text-center text-sm text-zinc-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 AG.ESHOP. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors">Next.js 16 (ISR)</span>
            <span className="hover:text-white transition-colors">Tailwind v4</span>
            <span className="hover:text-white transition-colors">Neon Postgres</span>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md glass-panel flex flex-col h-full shadow-2xl animate-fade-in border-l border-zinc-800">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Shopping Cart <span>({cartCount})</span>
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
                    <span className="text-4xl mb-4">🛒</span>
                    <p className="font-semibold text-zinc-400">Your cart is empty</p>
                    <p className="text-xs mt-1">Add items from the catalog page to start shopping!</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.product.id} className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-900 p-3 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-zinc-950 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                        {item.product.image.startsWith("http") || item.product.image.startsWith("data:image") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          item.product.image
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">${item.product.price.toFixed(2)} x {item.qty}</p>
                      </div>
                      <span className="font-extrabold text-sm text-white shrink-0">
                        ${(item.product.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 space-y-4">
                  <div className="flex items-center justify-between font-bold text-white text-base">
                    <span>Subtotal</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    * Zustand state will sync dynamically to Neon PostgreSQL during Module 7 Checkout flow.
                  </p>
                  <button 
                    onClick={() => alert("Checkout pipeline will be connected in Module 7!")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all border border-indigo-500/30 cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Chat Assistant Drawer */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        
        {/* Chat Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all glow-indigo cursor-pointer text-2xl border border-indigo-400/30"
        >
          {isChatOpen ? "✕" : "🤖"}
        </button>

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
