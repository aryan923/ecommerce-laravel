"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, cartCount, cartTotal, isLoading } = useCart();
  const { formatPrice } = useCurrency();

  if (!isCartOpen) return null;

  const items = cart?.items || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide-over Panel */}
        <div
          data-testid="cart-drawer-panel"
          className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">Shopping Cart ({cartCount})</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-base font-medium text-zinc-200">Your cart is empty</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Start Shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product || item.variant?.product || {};
                const variant = item.variant || {};
                const imageSrc = item.image_url || product.primary_image_url || '/placeholder.png';
                const itemPrice = item.unit_price || variant.price || product.price || 0;

                return (
                  <div
                    key={item.id || item.variant_id}
                    className="flex gap-4 p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                      {imageSrc && imageSrc !== '/placeholder.png' ? (
                        <Image
                          src={imageSrc}
                          alt={product.name || 'Product'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-zinc-100 truncate">
                            {product.name || 'Product'}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {variant.name && (
                          <p className="text-xs text-zinc-400 mt-0.5">{variant.name}</p>
                        )}
                        <p className="text-sm font-semibold text-indigo-400 mt-1">
                          {formatPrice(itemPrice)}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
                        <div className="flex items-center border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={isLoading || item.quantity <= 1}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-zinc-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-medium text-zinc-300">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-900/90 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-base font-bold text-white">{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs text-zinc-500">
                Shipping and taxes calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="py-2.5 text-center text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors border border-zinc-700"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="py-2.5 text-center text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
