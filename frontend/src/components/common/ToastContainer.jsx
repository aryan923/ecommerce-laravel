"use client";

import React from 'react';

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-zinc-800 text-white';
        let borderClass = 'border-zinc-700';

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-900 text-emerald-100';
          borderClass = 'border-emerald-700';
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-900 text-rose-100';
          borderClass = 'border-rose-700';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-900 text-amber-100';
          borderClass = 'border-amber-700';
        }

        return (
          <div
            key={toast.id}
            data-testid="toast-message"
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg border text-sm font-medium transition-all transform duration-300 animate-slide-in ${bgClass} ${borderClass}`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-4 text-xs opacity-70 hover:opacity-100 focus:outline-none"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
