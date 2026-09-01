"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, ArrowRight, MapPin, Calendar, CreditCard } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function OrderReceiptCard({ order = {} }) {
  const { formatPrice } = useCurrency();

  const orderNumber = order.order_number || 'ORD-2026-88492';
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const customerName = order.customer_name || 'Valued Customer';
  const customerEmail = order.customer_email || 'customer@example.com';
  const paymentMethod = order.payment_method || 'Cash on Delivery (COD)';
  const shippingAddress = typeof order.shipping_address === 'object'
    ? `${order.shipping_address.address_line_1 || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} ${order.shipping_address.postal_code || ''}`
    : (order.shipping_address || '123 Marine Drive, Mumbai, Maharashtra 400001');

  const items = order.items && order.items.length > 0 ? order.items : [
    { id: 1, product_name: 'Wireless Noise-Canceling Headphones', quantity: 1, unit_price: 1200, total_price: 1200 }
  ];

  const subtotal = order.subtotal || 1200;
  const discountAmount = order.discount_amount || 0;
  const shippingFee = order.shipping_fee || 0;
  const taxAmount = order.tax_amount || 216;
  const totalAmount = order.total_amount || (subtotal - discountAmount + shippingFee + taxAmount);

  return (
    <div data-testid="order-receipt-card" className="max-w-3xl mx-auto bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 pb-6 border-b border-stone-100">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Order Confirmed!</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium max-w-md mx-auto">
            Thank you for your purchase, <span className="font-bold text-stone-900">{customerName}</span>. We've sent a confirmation copy to <span className="font-bold text-stone-900">{customerEmail}</span>.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-xs font-extrabold text-stone-800">
          <span>Order Reference:</span>
          <span data-testid="order-number-badge" className="text-indigo-600">{orderNumber}</span>
        </div>
      </div>

      {/* Grid Meta Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
        <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
            <Calendar className="w-3.5 h-3.5 text-stone-400" /> Date Placed
          </div>
          <p className="font-extrabold text-stone-900">{createdAt}</p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
            <CreditCard className="w-3.5 h-3.5 text-stone-400" /> Payment Status
          </div>
          <p className="font-extrabold text-stone-900">{paymentMethod}</p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
            <Truck className="w-3.5 h-3.5 text-stone-400" /> Delivery Status
          </div>
          <p className="font-extrabold text-emerald-700">Processing Dispatch</p>
        </div>
      </div>

      {/* Shipping Address Summary */}
      <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Delivery Address
        </div>
        <p className="font-extrabold text-stone-900">{shippingAddress}</p>
      </div>

      {/* Items Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600" />
          <span>Purchased Items Breakdown</span>
        </h3>
        <div className="border border-stone-200/80 rounded-2xl overflow-hidden divide-y divide-stone-100">
          {items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-4">
                <h4 className="font-bold text-stone-900 truncate">{item.product_name || item.name || 'Product Item'}</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">Quantity: {item.quantity} &times; {formatPrice(item.unit_price || 0)}</p>
              </div>
              <span className="font-black text-stone-900 shrink-0">
                {formatPrice(item.total_price || (item.quantity * (item.unit_price || 0)))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="border-t border-stone-100 pt-4 space-y-2 text-xs text-stone-600 font-medium">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-semibold">
            <span>Discount Applied</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Shipping Charge</span>
          <span className="font-bold text-stone-900">
            {shippingFee === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Taxes (GST)</span>
          <span className="font-bold text-stone-900">{formatPrice(taxAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-black text-stone-900 pt-3 border-t border-stone-200/80">
          <span>Total Paid</span>
          <span className="text-indigo-600">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Link
          href="/products"
          className="py-3.5 px-6 text-center text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl transition-colors border border-stone-300/80"
        >
          Continue Shopping
        </Link>
        <Link
          href="/track-order"
          className="py-3.5 px-6 text-center text-xs font-extrabold uppercase tracking-wider bg-stone-950 hover:bg-stone-850 text-white rounded-xl transition-all shadow-md shadow-stone-950/20 flex items-center justify-center gap-1.5"
        >
          <span>Track Order Status</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
