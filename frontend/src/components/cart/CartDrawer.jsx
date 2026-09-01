"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { normalizeImageUrl } from '../../lib/image-helper';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, cartCount, subtotal, discountAmount, cartTotal, appliedCoupon, isLoading } = useCart();
  const { formatPrice } = useCurrency();

  if (!isCartOpen) return null;

  const items = cart?.items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-md transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide-over Panel */}
        <div
          data-testid="cart-drawer-panel"
          className="w-screen max-w-md bg-white border-l border-stone-200/80 text-stone-900 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-stone-900 tracking-tight">Shopping Cart</h2>
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-extrabold border border-stone-200/80">
                    {cartCount}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-medium">Review & checkout items</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-stone-50/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-20 h-20 rounded-3xl bg-stone-100 border border-stone-200/80 flex items-center justify-center mb-5 shadow-xs">
                  <ShoppingBag className="w-10 h-10 text-stone-400" />
                </div>
                <h3 className="text-lg font-black text-stone-900">Your cart is empty</h3>
                <p className="text-xs text-stone-500 mt-1.5 max-w-xs leading-relaxed">
                  Looks like you haven't added any products to your shopping cart yet.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-6 px-6 py-3 bg-stone-950 hover:bg-stone-850 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-stone-950/20 flex items-center gap-2"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product || item.variant?.product || {};
                const variant = item.variant || {};
                const rawImage = item.image_url || product.primary_image_url || product.primary_image || product.image_url;
                const imageSrc = normalizeImageUrl(rawImage);
                const itemPrice = item.price || item.unit_price || variant.price || product.price || 0;

                return (
                  <div
                    key={item.id || item.variant_id}
                    className="flex gap-3.5 p-3.5 bg-white border border-stone-200/80 rounded-2xl hover:border-stone-300 transition-all shadow-xs"
                  >
                    {/* Item Thumbnail */}
                    <div className="relative w-20 h-20 bg-stone-100 rounded-xl border border-stone-200/60 overflow-hidden shrink-0">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name || product.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + '/placeholder.svg') {
                              e.currentTarget.src = '/placeholder.svg';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-stone-900 truncate">
                            {item.name || product.name || 'Product Item'}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {(item.attributes || variant.name) && (
                          <p className="text-xs text-stone-500 font-medium mt-0.5 line-clamp-1">
                            {typeof item.attributes === 'object'
                              ? Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' | ')
                              : (variant.name || item.variant_sku)}
                          </p>
                        )}
                        <p className="text-sm font-extrabold text-indigo-600 mt-1">
                          {formatPrice(itemPrice)}
                        </p>
                      </div>

                      {/* Stepper & Line Total */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={isLoading || item.quantity <= 1}
                            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-extrabold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-black text-stone-900">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Financial Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200/80 bg-white shadow-lg space-y-4">
              <div className="space-y-2 text-xs text-stone-600 font-medium">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" /> Coupon Savings ({appliedCoupon?.code})
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-stone-200/80 text-base font-black text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free shipping & 256-Bit SSL Encrypted Checkout</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="py-3 text-center text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl transition-colors border border-stone-300/80"
                >
                  View Cart Page
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="py-3 text-center text-xs font-extrabold uppercase tracking-wider bg-stone-950 hover:bg-stone-850 text-white rounded-xl transition-all shadow-md shadow-stone-950/20 flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
