"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

export default function WishlistHeader({ itemCount = 0 }) {
  const { clearWishlist } = useWishlist();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    clearWishlist();
    setShowConfirm(false);
  };

  return (
    <div data-testid="wishlist-header">
      {/* Main Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              My Saved Wishlist
            </h1>
            {itemCount > 0 && (
              <span className="bg-stone-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Save your favorite luxury pieces for later or move them instantly into your cart.
          </p>
        </div>

        {itemCount > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            data-testid="clear-all-wishlist-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 text-xs font-bold rounded-xl transition-all shrink-0 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Wishlist</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-950 mb-1">Clear Entire Wishlist?</h3>
            <p className="text-xs text-stone-500 mb-6">
              Are you sure you want to remove all saved items from your wishlist? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

