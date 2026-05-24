import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Query db metrics
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const lowStockCount = await prisma.product.count({
    where: { stock: { lte: 5 } },
  });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  // Calculate metrics
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter(
    (o) => o.status !== "PENDING" && o.status !== "CANCELLED"
  );
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);

  // Fetch low stock items for detail listing
  const lowStockItems = await prisma.product.findMany({
    where: { stock: { lte: 5 } },
    orderBy: { stock: "asc" },
    take: 5,
    include: {
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Console Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">Real-time store metrics, inventory alerts, and transaction history.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">Total Revenue</span>
          <span className="text-3xl font-black mt-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ${totalRevenue.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-400 mt-2 font-medium">From {completedOrders.length} completed transactions</span>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all"></div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">Sales Volume</span>
          <span className="text-3xl font-black mt-2 text-white">{totalOrdersCount}</span>
          <span className="text-[10px] text-zinc-400 mt-2 font-medium">Total orders registered</span>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all"></div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">Active Products</span>
          <span className="text-3xl font-black mt-2 text-white">{totalProducts}</span>
          <span className="text-[10px] text-indigo-400 font-semibold mt-2 hover:underline">
            <Link href="/admin/products">Manage catalog ({totalCategories} categories) →</Link>
          </span>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl group-hover:bg-red-500/10 transition-all"></div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-500">Low Stock Alerts</span>
          <span className={`text-3xl font-black mt-2 ${lowStockCount > 0 ? "text-red-400 animate-pulse" : "text-zinc-50"}`}>
            {lowStockCount}
          </span>
          <span className="text-[10px] text-zinc-400 mt-2 font-medium">Products with 5 or fewer items remaining</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-extrabold text-lg text-white">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs font-bold text-indigo-400 hover:underline">
                View all orders →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <span className="text-3xl">📭</span>
                <p className="font-semibold text-zinc-400 mt-2">No orders recorded yet</p>
                <p className="text-xs mt-1">Customers will appear here when checkout flows are active.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-bold">
                      <th className="py-3">Order ID</th>
                      <th className="py-3">Customer</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Method</th>
                      <th className="py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-4 font-mono font-bold text-zinc-400">
                          {order.id.substring(0, 8)}...
                        </td>
                        <td className="py-4">
                          <div className="font-bold text-zinc-200">{order.user?.name || "Guest user"}</div>
                          <div className="text-[10px] text-zinc-500">{order.user?.email || "No email"}</div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                              : order.status === "PAID" || order.status === "PROCESSING"
                              ? "bg-indigo-950/40 text-indigo-400 border-indigo-900/50"
                              : order.status === "CANCELLED"
                              ? "bg-red-950/40 text-red-400 border-red-900/50"
                              : "bg-amber-950/40 text-amber-400 border-amber-900/50"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-[10px] text-zinc-400">
                          {order.paymentMethod}
                        </td>
                        <td className="py-4 text-right font-bold text-white">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Sidebar */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-white mb-6">Inventory Warnings</h2>
            
            {lowStockItems.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <span className="text-3xl">✅</span>
                <p className="font-semibold text-zinc-400 mt-2">All stock levels healthy</p>
                <p className="text-xs mt-1">No products are running low in stock currently.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl hover:scale-[1.01] transition-transform">
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-200 truncate text-xs">{product.name}</div>
                      <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5">
                        {product.category?.name}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        product.stock === 0
                          ? "bg-red-950 text-red-400 border border-red-900/50"
                          : "bg-amber-950 text-amber-400 border border-amber-900/50"
                      }`}>
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lowStockItems.length > 0 && (
            <Link 
              href="/admin/products"
              className="mt-6 w-full text-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold py-2 rounded-xl text-xs transition-all cursor-pointer block"
            >
              Adjust Stock Quantities
            </Link>
          )}
        </div>

      </div>

    </div>
  );
}
