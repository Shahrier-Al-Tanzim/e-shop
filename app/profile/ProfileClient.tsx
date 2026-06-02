"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { updateCustomerProfile } from "@/app/actions/profile";

import type { OrderStatus, PaymentMethod } from "@prisma/client";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface OrderItem {
  id: string;
  qty: number;
  priceAtPurchase: number;
  product: Product | null;
}

interface Order {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  address: string;
  createdAt: Date;
  items: OrderItem[];
}

interface ProfileClientProps {
  userName: string;
  userEmail: string;
  userRole: string;
  userCreatedAt: Date | string;
  defaultAddress: string;
  defaultPhone: string;
  initialOrders: any[];
  reviews?: Array<{ productId: string; rating: number }>;
  initialNotifications?: any[];
}

type TabType = "ORDERS" | "SETTINGS" | "NOTIFICATIONS";

export default function ProfileClient({
  userName,
  userEmail,
  userRole,
  userCreatedAt,
  defaultAddress,
  defaultPhone,
  initialOrders,
  reviews = [],
  initialNotifications = [],
}: ProfileClientProps) {
  const [orders] = useState<Order[]>(initialOrders as Order[]);
  const [notifications, setNotifications] = useState<any[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<TabType>("ORDERS");

  // Review System States
  const [userReviews, setUserReviews] = useState<Array<{ productId: string; rating: number }>>(reviews);
  const [activeReviewProduct, setActiveReviewProduct] = useState<{ id: string; name: string; image: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewError, setReviewError] = useState<string>("");
  const [reviewSuccess, setReviewSuccess] = useState<string>("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState<boolean>(false);

  const [address, setAddress] = useState(defaultAddress);
  const [phone, setPhone] = useState(defaultPhone);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const handleMarkAsRead = async (id: string) => {
    try {
      const { markAsRead } = await import("@/app/actions/notifications");
      const res = await markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { markAllAsRead } = await import("@/app/actions/notifications");
      const res = await markAllAsRead(false);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Read files as Base64 strings
    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        setReviewError("Images must be smaller than 20MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImages((prev) => [...prev, reader.result as string].slice(0, 3)); // Max 3 images
      };
      reader.readAsDataURL(file);
    });
  };

  const submitReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewProduct) return;
    
    setReviewError("");
    setReviewSuccess("");
    setIsReviewSubmitting(true);

    try {
      const { submitReview } = await import("@/app/actions/review");
      const formData = new FormData();
      formData.append("productId", activeReviewProduct.id);
      formData.append("rating", reviewRating.toString());
      formData.append("comment", reviewComment);
      formData.append("images", JSON.stringify(reviewImages));

      const response = await submitReview(null, formData);
      if (response.error) {
        setReviewError(response.error);
      } else {
        setReviewSuccess(response.success || "Review posted successfully!");
        // Update local state to show "Reviewed" badge instantly
        setUserReviews((prev) => [...prev, { productId: activeReviewProduct.id, rating: reviewRating }]);
        
        // Reset form after short delay
        setTimeout(() => {
          setActiveReviewProduct(null);
          setReviewComment("");
          setReviewImages([]);
          setReviewSuccess("");
        }, 1500);
      }
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "" });

    if (!address.trim() || !phone.trim()) {
      setStatusMsg({ type: "error", text: "Address and Phone defaults cannot be empty." });
      return;
    }

    startTransition(async () => {
      const res = await updateCustomerProfile(address, phone);
      if (res.success) {
        setStatusMsg({ type: "success", text: "Default delivery options updated successfully!" });
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to update profile settings." });
      }
    });
  };

  // Function to resolve visual progress bubble checkmarks
  const getFulfillmentStep = (status: Order["status"]): number => {
    switch (status) {
      case "PENDING":
        return 1;
      case "PAID":
        return 2;
      case "PROCESSING":
        return 3;
      case "SHIPPED":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 0; // CANCELLED
    }
  };

  const stepsList = [
    { label: "Order Placed", stepNum: 1 },
    { label: "Paid & Verified", stepNum: 2 },
    { label: "Processing", stepNum: 3 },
    { label: "Shipped", stepNum: 4 },
    { label: "Delivered", stepNum: 5 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans relative">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* Glassmorphic Navbar */}
      <nav className="glass-navbar sticky top-0 z-40 w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
              E Shop
            </Link>
            <span className="text-[10px] uppercase tracking-widest bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700 font-bold">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Catalog
            </Link>
            <span className="text-zinc-800">|</span>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 z-10 flex flex-col">
        
        {/* Profile Card Header */}
        <div className="glass-panel p-8 rounded-3xl border border-zinc-800/80 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Customer Account</span>
            <h1 className="text-3xl font-black text-white">{userName}</h1>
            <p className="text-xs text-zinc-400 font-medium">{userEmail}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-550 block">Account Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-450 bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-900/30 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Active Buyer
            </span>
          </div>
        </div>

        {/* 2-Column Tabs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start flex-1">
          
          {/* Left Column Tabs Side Menu */}
          <div className="md:col-span-3 flex flex-row md:flex-col gap-2 bg-zinc-900/30 border border-zinc-900/50 p-2 rounded-2xl md:w-full">
            <button
              onClick={() => {
                setActiveTab("ORDERS");
                setStatusMsg({ type: "", text: "" });
              }}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 text-xs font-extrabold px-4 py-3 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === "ORDERS"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-550"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <span>📝</span> Purchases History
            </button>
            
            <button
              onClick={() => {
                setActiveTab("SETTINGS");
                setStatusMsg({ type: "", text: "" });
              }}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 text-xs font-extrabold px-4 py-3 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === "SETTINGS"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-550"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <span>⚙️</span> General Settings
            </button>

            <button
              onClick={() => {
                setActiveTab("NOTIFICATIONS");
                setStatusMsg({ type: "", text: "" });
              }}
              className={`flex-1 md:flex-none flex items-center justify-between gap-2.5 text-xs font-extrabold px-4 py-3 rounded-xl transition-all cursor-pointer select-none ${
                activeTab === "NOTIFICATIONS"
                  ? "bg-indigo-600 text-white shadow-lg border border-indigo-550"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>🔔</span> Notifications
              </div>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
          </div>

          {/* Right Column Active Panel Content */}
          <div className="md:col-span-9 space-y-6">
            
            {/* Purchase History Ledger Panel */}
            {activeTab === "ORDERS" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-extrabold text-white">Purchase Transactions</h2>
                  <p className="text-zinc-405 text-xs">Verify your registered invoices, delivery schedules, and fulfillment progress states.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="py-20 glass-panel rounded-3xl p-8 border border-zinc-800 shadow-xl text-center">
                    <span className="text-4xl mb-4 select-none block animate-bounce">📦</span>
                    <h3 className="text-base font-extrabold text-zinc-300">No purchases found</h3>
                    <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                      You haven't checked out any order items yet! Visit our live database storefront catalog to start shopping.
                    </p>
                    <Link 
                      href="/"
                      className="mt-6 inline-flex bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all text-xs"
                    >
                      Browse Storefront
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const currentStep = getFulfillmentStep(order.status);
                      const isCancelled = order.status === "CANCELLED";

                      return (
                        <div 
                          key={order.id} 
                          className="glass-panel p-6 rounded-3xl border border-zinc-805 shadow-2xl flex flex-col gap-6 relative overflow-hidden"
                        >
                          
                          {/* Card Header */}
                          <div className="flex flex-wrap items-center justify-between border-b border-zinc-900 pb-4 gap-4">
                            <div className="space-y-1">
                              <span className="text-[8px] uppercase font-extrabold tracking-widest text-zinc-500">Invoice ID</span>
                              <span className="text-xs font-mono font-bold text-zinc-300 block">#{order.id.substring(0, 18)}...</span>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <span className="text-[8px] uppercase font-extrabold tracking-widest text-zinc-500 block">Date Placed</span>
                                <span className="text-xs text-zinc-400 font-semibold block">
                                  {new Date(order.createdAt).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] uppercase font-extrabold tracking-widest text-zinc-500 block">Total</span>
                                <span className="text-xs font-black text-indigo-400 block">${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Step Milestone Tracker */}
                          {isCancelled ? (
                            <div className="bg-red-950/20 border border-red-900/35 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
                              <span>🛑</span> This transaction has been cancelled.
                            </div>
                          ) : (
                            <div className="w-full py-2 overflow-x-auto">
                              <div className="min-w-[500px] flex items-center justify-between relative px-2">
                                
                                <div className="absolute top-[16px] left-[5%] right-[5%] h-[2px] bg-zinc-850 z-0">
                                  <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                    style={{
                                      width: `${((currentStep - 1) / 4) * 100}%`
                                    }}
                                  ></div>
                                </div>

                                {stepsList.map((step) => {
                                  const isCompleted = currentStep >= step.stepNum;
                                  const isActive = currentStep === step.stepNum;

                                  return (
                                    <div key={step.stepNum} className="flex flex-col items-center gap-2 z-10 select-none shrink-0 relative">
                                      <span 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                                          isCompleted
                                            ? "bg-indigo-650 border-indigo-500 text-white shadow-lg"
                                            : "bg-zinc-950 border-zinc-800 text-zinc-550"
                                        } ${isActive ? "ring-4 ring-indigo-500/20" : ""}`}
                                      >
                                        {isCompleted ? "✓" : step.stepNum}
                                      </span>
                                      <span 
                                        className={`text-[9px] uppercase font-black tracking-wider ${
                                          isCompleted ? "text-zinc-200" : "text-zinc-550"
                                        }`}
                                      >
                                        {step.label}
                                      </span>
                                    </div>
                                  );
                                })}

                              </div>
                            </div>
                          )}

                          {/* Items items listing */}
                          <div className="space-y-3">
                            <h5 className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-500">Ordered Products</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {order.items.map((item) => {
                                  const isPaidOrCompleted = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status);
                                  const reviewedProduct = item.product ? userReviews.find((r) => r.productId === item.product!.id) : null;

                                  return (
                                    <div key={item.id} className="flex flex-col gap-3 bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center text-xl overflow-hidden shrink-0 border border-zinc-900">
                                          {item.product?.images?.[0] && (item.product.images[0].startsWith("http") || item.product.images[0].startsWith("data:image")) ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                          ) : (
                                            item.product?.images?.[0] || "📦"
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h6 className="text-[10px] font-bold text-white truncate">{item.product?.name || "Product"}</h6>
                                          <p className="text-[8px] text-zinc-550 mt-0.5">${item.priceAtPurchase.toFixed(2)} each</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="text-[9px] text-zinc-550 block">Qty: {item.qty}</span>
                                          <span className="text-[10px] font-bold text-white block">${(item.priceAtPurchase * item.qty).toFixed(2)}</span>
                                        </div>
                                      </div>

                                      {/* Ratings Submission Triggers */}
                                      {order.status === "DELIVERED" && item.product && (
                                        <div className="pt-2 border-t border-zinc-950 flex items-center justify-between">
                                          {reviewedProduct ? (
                                            <span className="text-[9px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/20 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                                              Reviewed ({reviewedProduct.rating} ★)
                                            </span>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setReviewError("");
                                                setReviewSuccess("");
                                                setReviewComment("");
                                                setReviewImages([]);
                                                setReviewRating(5);
                                                setActiveReviewProduct({
                                                  id: item.product!.id,
                                                  name: item.product!.name,
                                                  image: item.product!.images[0] || "📦",
                                                });
                                              }}
                                              className="text-[9px] bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                                            >
                                              ★ Write a Review
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>

                          {/* Footer parameters */}
                          <div className="text-[9px] text-zinc-550 border-t border-zinc-900/70 pt-4 leading-relaxed flex flex-wrap gap-x-6 gap-y-1">
                            <span>💳 Payment: <strong className="text-zinc-400 uppercase font-mono font-bold">{order.paymentMethod}</strong></span>
                            <span>📍 Address: <strong className="text-zinc-400 font-bold">{order.address}</strong></span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Modal Review Submission Form overlay */}
            {activeReviewProduct && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-zinc-800 shadow-2xl relative animate-fade-in space-y-6">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-850 overflow-hidden text-lg shrink-0">
                        {activeReviewProduct.image.startsWith("http") || activeReviewProduct.image.startsWith("data:image") ? (
                          <img src={activeReviewProduct.image} alt={activeReviewProduct.name} className="w-full h-full object-cover" />
                        ) : (
                          activeReviewProduct.image
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white truncate max-w-[200px]">Review: {activeReviewProduct.name}</h3>
                        <p className="text-[9px] text-zinc-550">Share your rating and upload photos</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveReviewProduct(null)}
                      className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form Messages */}
                  {reviewError && (
                    <div className="p-3 bg-red-950/20 border border-red-900/35 text-red-400 text-xs rounded-xl font-bold">
                      ⚠️ {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-450 text-xs rounded-xl font-bold">
                      ✓ {reviewSuccess}
                    </div>
                  )}

                  {/* Review inputs Form */}
                  <form onSubmit={submitReviewAction} className="space-y-4">
                    
                    {/* Star Rating select */}
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-550">Product Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setReviewRating(starVal)}
                            className="text-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                          >
                            <span className={starVal <= reviewRating ? "text-amber-400" : "text-zinc-800"}>★</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback comment input */}
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-550">Comment Feedback</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you think of the design, build quality, and value?"
                        rows={4}
                        required
                        className="w-full bg-zinc-950 border border-zinc-855 text-xs rounded-xl px-4.5 py-3 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Review Photo Upload */}
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase font-bold tracking-widest text-zinc-550">Upload Photos (Max 3)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewImageChange}
                        disabled={reviewImages.length >= 3}
                        className="w-full bg-zinc-950 text-xs text-zinc-400 border border-zinc-855 rounded-xl file:bg-zinc-900 file:border-0 file:text-white file:text-xs file:font-semibold file:px-4 file:py-2.5 file:cursor-pointer hover:file:bg-zinc-800 cursor-pointer"
                      />

                      {/* Display thumbnail previews of base64 loaded images */}
                      {reviewImages.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {reviewImages.map((imgBase64, idx) => (
                            <div key={idx} className="relative w-12 h-12 rounded-lg border border-zinc-800 overflow-hidden bg-zinc-950 shrink-0">
                              <img src={imgBase64} alt="Upload preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReviewImages((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1 -right-1 bg-red-650 hover:bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveReviewProduct(null)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 text-xs font-bold py-3 rounded-xl border border-zinc-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isReviewSubmitting || reviewComment.trim().length < 3}
                        className={`flex-1 text-xs font-bold py-3 rounded-xl border transition-all ${
                          isReviewSubmitting || reviewComment.trim().length < 3
                            ? "bg-zinc-900 text-zinc-650 border-zinc-800 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 cursor-pointer"
                        }`}
                      >
                        {isReviewSubmitting ? "Uploading..." : "Post Review"}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}


            {/* General Settings Panel */}
            {activeTab === "SETTINGS" && (
              <div className="glass-panel p-8 rounded-3xl border border-zinc-800/80 space-y-8 shadow-2xl relative">
                
                <div className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
                  <h2 className="text-xl font-extrabold text-white">⚙️ Default Preferences</h2>
                  <p className="text-zinc-400 text-xs">Configure your default contact information and shipping credentials to accelerate checkout flows.</p>
                </div>

                {statusMsg.text && (
                  <div className={`p-4 rounded-xl text-xs font-semibold border ${
                    statusMsg.type === "success"
                      ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-450"
                      : "bg-red-950/20 border-red-900/35 text-red-400"
                  }`}>
                    {statusMsg.type === "success" ? "✓" : "⚠️"} {statusMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                      Default Delivery Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Luxury Avenue, Penthouse B, Silicon Valley, CA 94025"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-850 text-xs rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium placeholder-zinc-650 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                      Default Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 987-6543"
                      className="w-full bg-zinc-950 border border-zinc-850 text-xs rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium placeholder-zinc-655 transition-colors"
                    />
                  </div>

                  <div className="pt-2 border-t border-zinc-900">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-lg hover:scale-[1.01] disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer disabled:cursor-not-allowed border border-zinc-200/20"
                    >
                      {isPending ? "Saving Defaults..." : "Save Default Preferences"}
                    </button>
                  </div>

                </form>

                {/* Additional non-editable credentials metadata */}
                <div className="bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-3.5 pt-4 text-xs font-medium text-zinc-450">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-500 border-b border-zinc-900 pb-2">
                    System Identity Ledger
                  </h4>
                  <div className="flex items-center justify-between">
                    <span>Registered Email Address</span>
                    <span className="text-zinc-200 font-bold">{userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Privileges Access</span>
                    <span className="text-indigo-400 font-bold uppercase tracking-wider">{userRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Account Creation Date</span>
                    <span className="text-zinc-300">
                      {new Date(userCreatedAt).toLocaleDateString([], {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "NOTIFICATIONS" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-extrabold text-white">Notifications</h2>
                    <p className="text-zinc-400 text-xs">Stay updated on order payments, dispatch tracking, and fulfillment progress.</p>
                  </div>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer select-none"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-20 glass-panel rounded-3xl p-8 border border-zinc-800 shadow-xl text-center">
                    <span className="text-4xl mb-4 select-none block">🔔</span>
                    <h3 className="text-base font-extrabold text-zinc-300">No notifications</h3>
                    <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                      You are all caught up! Updates regarding your order fulfillment will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`glass-panel p-5 rounded-2xl border transition-all flex justify-between items-start gap-4 ${
                          notif.isRead
                            ? "border-zinc-900 bg-zinc-950/20 opacity-60"
                            : "border-indigo-900/40 bg-indigo-950/5 shadow-md shadow-indigo-500/5"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                            )}
                            <h4 className="text-sm font-bold text-white leading-none">{notif.title}</h4>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed pt-1">{notif.message}</p>
                          <span className="text-[10px] text-zinc-500 block pt-1.5">
                            {new Date(notif.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/45 px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-8 text-center text-xs text-zinc-550 z-10">
        © 2026 E Shop. Secure Edge Fulfillment Ledgers.
      </footer>

    </div>
  );
}
