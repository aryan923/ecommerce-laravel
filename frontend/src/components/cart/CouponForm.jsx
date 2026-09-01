"use client";

import React, { useState } from 'react';
import { Tag, Check, X, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CouponForm() {
  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon, isLoading, couponError, couponSuccess } = useCart();
  const { formatPrice } = useCurrency();
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const ok = await applyCoupon(code);
    if (ok) {
      setCode('');
    }
  };

  return (
    <div data-testid="coupon-section" className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
        <Tag className="w-4 h-4 text-indigo-600" />
        <h3>Promotional Coupon Code</h3>
      </div>

      {/* Active Coupon Chip */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs tracking-wider uppercase truncate">
                {appliedCoupon.code || 'COUPON APPLIED'}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                You saved {formatPrice(discountAmount)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            disabled={isLoading}
            className="p-1.5 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
            title="Remove Coupon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Coupon Input Form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code (e.g. SAVE10)"
              className="flex-1 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Apply
            </button>
          </div>
        </form>
      )}

      {/* Alerts */}
      {couponError && (
        <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200/60">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{couponError}</span>
        </div>
      )}
      {couponSuccess && !appliedCoupon && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
          <Check className="w-4 h-4 shrink-0" />
          <span>{couponSuccess}</span>
        </div>
      )}
    </div>
  );
}
