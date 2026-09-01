"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function OrderSummaryCard() {
  const { subtotal, discountAmount, taxEstimate, shippingEstimate, cartTotal, appliedCoupon, items } = useCart();
  const { formatPrice } = useCurrency();

  const isCartEmpty = !items || items.length === 0;

  return (
    <div data-testid="order-summary-card" className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm flex flex-col gap-6 sticky top-24">
      <h3 className="text-base font-extrabold text-stone-900 tracking-tight pb-3 border-b border-stone-200/80">
        Order Financial Summary
      </h3>

      <div className="flex flex-col gap-3 text-xs text-stone-600 font-medium">
        <div className="flex justify-between items-center">
          <span>Items Subtotal</span>
          <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 font-semibold">
            <span>Coupon Savings ({appliedCoupon?.code || 'DISCOUNT'})</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Estimated Shipping</span>
          <span>{shippingEstimate > 0 ? formatPrice(shippingEstimate) : 'Free Shipping'}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Estimated Taxes</span>
          <span>{taxEstimate > 0 ? formatPrice(taxEstimate) : 'Calculated at Checkout'}</span>
        </div>

        <div className="pt-4 border-t border-stone-200/80 flex justify-between items-baseline">
          <span className="text-sm font-extrabold text-stone-900">Grand Total</span>
          <div className="text-right">
            <span className="text-xl font-black text-indigo-600">{formatPrice(cartTotal)}</span>
            <p className="text-[10px] text-stone-400 font-normal">Includes taxes & duties</p>
          </div>
        </div>
      </div>

      {/* Checkout CTA */}
      <Link
        href={isCartEmpty ? '#' : '/checkout'}
        aria-disabled={isCartEmpty}
        className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all ${
          isCartEmpty
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
            : 'bg-stone-950 hover:bg-stone-850 text-white shadow-stone-950/20 hover:shadow-stone-950/30'
        }`}
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Security & Trust Badges */}
      <div className="pt-4 border-t border-stone-100 flex flex-col gap-2.5 text-[11px] text-stone-500">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>256-Bit SSL Encrypted & Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>Express Dispatch & Free Returns Policy</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>100% Genuine Brand Direct Products</span>
        </div>
      </div>
    </div>
  );
}
