"use client";

import React, { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/admin";

export default function OrderStatusDropdown({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;
    setStatus(nextStatus);

    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
    });
  };

  const getStatusColor = (val: string) => {
    switch (val) {
      case "DELIVERED":
        return "border-emerald-900/50 text-emerald-400 bg-emerald-950/20";
      case "PAID":
      case "PROCESSING":
        return "border-indigo-900/50 text-indigo-400 bg-indigo-950/20";
      case "SHIPPED":
        return "border-violet-900/50 text-violet-400 bg-violet-950/20";
      case "CANCELLED":
        return "border-red-900/50 text-red-400 bg-red-950/20";
      default:
        return "border-amber-900/50 text-amber-400 bg-amber-950/20";
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      {isPending && (
        <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin shrink-0"></span>
      )}
      
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`text-[10px] font-bold uppercase rounded-lg border px-2.5 py-1.5 focus:outline-none transition-all cursor-pointer disabled:opacity-50 ${getStatusColor(
          status
        )}`}
      >
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  );
}
