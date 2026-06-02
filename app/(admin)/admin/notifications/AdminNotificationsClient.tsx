"use client";

import React, { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface AdminNotificationsClientProps {
  initialNotifications: Notification[];
}

export default function AdminNotificationsClient({
  initialNotifications,
}: AdminNotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

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
      const res = await markAllAsRead(true);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Alerts Log</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time notifications regarding transaction fulfillments, payments, and stock warnings.
          </p>
        </div>
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold bg-indigo-650 hover:bg-indigo-500 border border-indigo-500/30 text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md select-none"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-20 glass-panel rounded-3xl p-8 border border-zinc-800 shadow-xl text-center">
          <span className="text-4xl mb-4 select-none block">🔔</span>
          <h3 className="text-base font-extrabold text-zinc-300">All caught up!</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
            There are no active notifications. Check back later as operations log events.
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
                <span className="text-[10px] text-zinc-550 block pt-1.5">
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
  );
}
