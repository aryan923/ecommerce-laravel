"use client";

import React from 'react';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function CheckoutSummarySidebar({
  items = [],
  subtotal = 0,
  discountAmount = 0,
  shippingFee = 0,
  taxAmount = 0,
  taxData = null,
  grandTotal = 0,
  appliedCoupon = null,
  isSubmitting = false,
  onPlaceOrder,
}) {
  const { formatPrice } = useCurrency();

  return (
    <div data-testid="checkout-summary-sidebar" className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-5 sticky top-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-indigo-600" />
          <span>Order Summary</span>
        </h3>
        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-200/80">
          {items.reduce((sum, i) => sum + (i.quantity || 1), 0)} Items
        </span>
      </div>

      {/* Item Cards Preview List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => {
          const product = item.product || item.variant?.product || {};
          const imageSrc = item.image_url || product.primary_image_url || product.primary_image || '/placeholder.png';
          const unitPrice = item.price || item.unit_price || product.price || 0;

          return (
            <div key={item.id || item.variant_id} className="flex gap-3 items-center">
              <div className="relative w-12 h-12 bg-stone-100 rounded-xl overflow-hidden border border-stone-200/60 shrink-0">
                {imageSrc && imageSrc !== '/placeholder.png' ? (
                  <Image src={imageSrc} alt={item.name || 'Product'} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">No Img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-stone-900 truncate">{item.name || product.name || 'Item'}</h4>
                <p className="text-[11px] text-stone-500">Qty: {item.quantity} &times; {formatPrice(unitPrice)}</p>
              </div>
              <span className="text-xs font-black text-stone-900 shrink-0">
                {formatPrice(unitPrice * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Financial Breakdown Table */}
      <div className="border-t border-stone-100 pt-3 space-y-2 text-xs font-medium text-stone-600">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600" /> Discount ({appliedCoupon?.code})
            </span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Shipping Fee</span>
          <span className="font-bold text-stone-900">
            {shippingFee === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : formatPrice(shippingFee)}
          </span>
        </div>

        <div className="flex flex-col gap-1 py-1 border-t border-b border-stone-100 my-1">
          <div className="flex items-center justify-between">
            <span>Estimated Taxes (GST)</span>
            <span className="font-bold text-stone-900">{formatPrice(taxAmount)}</span>
          </div>
          {taxData?.cgst > 0 && (
            <div className="flex items-center justify-between text-[11px] text-stone-400 pl-2">
              <span>CGST (9%)</span>
              <span>{formatPrice(taxData.cgst)}</span>
            </div>
          )}
          {taxData?.sgst > 0 && (
            <div className="flex items-center justify-between text-[11px] text-stone-400 pl-2">
              <span>SGST (9%)</span>
              <span>{formatPrice(taxData.sgst)}</span>
            </div>
          )}
          {taxData?.igst > 0 && (
            <div className="flex items-center justify-between text-[11px] text-stone-400 pl-2">
              <span>IGST (18%)</span>
              <span>{formatPrice(taxData.igst)}</span>
            </div>
          )}
          {(!taxData || (!taxData.cgst && !taxData.sgst && !taxData.igst)) && taxAmount > 0 && (
            <div className="flex items-center justify-between text-[11px] text-stone-400 pl-2">
              <span>Standard GST (18%)</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-200/80">
          <span>Grand Total</span>
          <span className="text-indigo-600">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Place Order CTA Button */}
      <button
        type="button"
        data-testid="place-order-btn"
        onClick={onPlaceOrder}
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 disabled:opacity-50 text-white text-xs font-extrabold tracking-wide rounded-xl transition-all shadow-md shadow-stone-950/20 flex items-center justify-center gap-2"
      >
        <span>{isSubmitting ? 'Processing Order...' : 'Place Order & Pay'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Money-Back Guarantee &bull; SSL Secured</span>
      </div>
    </div>
  );
}
