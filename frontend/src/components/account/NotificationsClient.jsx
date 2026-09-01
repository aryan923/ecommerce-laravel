"use client";

import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import apiClient from '../../lib/api-client';

export default function NotificationsClient() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/customer/notifications');
      const list = res.data?.data || res.data || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Notifications fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.patch(`/customer/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.warn('Mark read notice:', err);
    }
  };

  return (
    <div data-testid="customer-notifications" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">In-App Notifications</h1>
          <p className="text-xs text-stone-500 mt-0.5">Stay updated on order status changes, dispatches, and refunds.</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => {
          const isRead = Boolean(n.is_read || n.read_at);

          return (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                isRead ? 'bg-white border-stone-200/80' : 'bg-stone-100/90 border-stone-300 shadow-xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className={`w-4 h-4 ${isRead ? 'text-stone-400' : 'text-indigo-600'}`} />
                  <h4 className="text-xs font-bold text-stone-900">{n.title || 'Notification Update'}</h4>
                  {!isRead && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{n.content || n.message || n.body}</p>
                <p className="text-[10px] text-stone-400">
                  {new Date(n.created_at || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {!isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          );
        })}

        {!isLoading && notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
            <Bell className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900">No Notifications</h3>
            <p className="text-xs text-stone-500">You are all caught up! Important account updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
