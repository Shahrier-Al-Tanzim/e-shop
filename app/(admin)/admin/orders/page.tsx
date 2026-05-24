import React from "react";
import prisma from "@/lib/prisma";
import OrderStatusDropdown from "./OrderStatusDropdown";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Customer Orders</h1>
        <p className="text-zinc-400 text-sm mt-1">Monitor sales, review transaction details, and manage shipping fulfillment updates.</p>
      </div>

      {/* Orders Table Card */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <span className="text-4xl">💳</span>
            <p className="font-semibold text-zinc-400 mt-3">No orders found</p>
            <p className="text-xs mt-1">Operational purchase flows will list customer order cards here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider font-bold">
                  <th className="py-3 pl-2">Order ID</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Method</th>
                  <th className="py-3 text-right pr-2">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors">
                    
                    {/* ID */}
                    <td className="py-4 pl-2 font-mono font-bold text-zinc-400">
                      #{order.id.substring(0, 8)}...
                    </td>

                    {/* Date */}
                    <td className="py-4 text-zinc-300">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Customer */}
                    <td className="py-4">
                      <div className="font-bold text-zinc-200">{order.user?.name || "Guest"}</div>
                      <div className="text-[10px] text-zinc-500">{order.user?.email || "No email"}</div>
                    </td>

                    {/* Total */}
                    <td className="py-4 font-bold text-white text-sm">
                      ${order.total.toFixed(2)}
                    </td>

                    {/* Method */}
                    <td className="py-4">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                        {order.paymentMethod}
                      </span>
                    </td>

                    {/* Status with interactive dropdown */}
                    <td className="py-4 text-right pr-2">
                      <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
