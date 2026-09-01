"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function CartTable() {
  const { items, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const { formatPrice } = useCurrency();

  if (!items || items.length === 0) return null;

  return (
    <div data-testid="cart-table-wrapper" className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table data-testid="cart-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200/80 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
              <th className="py-4 px-6">Product Item</th>
              <th className="py-4 px-4 text-center">Unit Price</th>
              <th className="py-4 px-4 text-center">Quantity</th>
              <th className="py-4 px-4 text-right">Line Total</th>
              <th className="py-4 px-4 text-center w-12"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/60 text-sm text-stone-800">
            {items.map((item) => {
              const product = item.product || item.variant?.product || {};
              const variant = item.variant || {};
              const imageSrc = item.image_url || product.primary_image_url || product.primary_image || '/placeholder.png';
              const unitPrice = item.price || item.unit_price || variant.price || product.price || 0;
              const maxStock = item.stock_qty ?? variant.stock_qty ?? 99;

              return (
                <tr key={item.id || item.variant_id} className="hover:bg-stone-50/40 transition-colors">
                  {/* Item Image & Details */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl bg-stone-100 border border-stone-200/60 overflow-hidden shrink-0">
                        {imageSrc && imageSrc !== '/placeholder.png' ? (
                          <Image
                            src={imageSrc}
                            alt={item.name || product.name || 'Item'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/products/${product.slug || item.slug || ''}`}
                          className="font-bold text-stone-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {item.name || product.name || 'Cart Item'}
                        </Link>
                        {item.attributes && typeof item.attributes === 'object' ? (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {Object.entries(item.attributes).map(([attrKey, attrVal]) => (
                              <span
                                key={attrKey}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-semibold text-stone-600 border border-stone-200/60"
                              >
                                {attrKey}: {attrVal}
                              </span>
                            ))}
                          </div>
                        ) : (
                          variant.name && (
                            <span className="text-xs text-stone-500 font-medium">
                              {variant.name}
                            </span>
                          )
                        )}
                        {(item.variant_sku || variant.sku) && (
                          <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                            SKU: {item.variant_sku || variant.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-5 px-4 text-center font-medium text-stone-700">
                    {formatPrice(unitPrice)}
                  </td>

                  {/* Quantity Stepper */}
                  <td className="py-5 px-4 text-center">
                    <div className="inline-flex items-center border border-stone-300 rounded-xl bg-white shadow-xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={isLoading || item.quantity <= 1}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-extrabold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading || item.quantity >= maxStock}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Line Total */}
                  <td className="py-5 px-4 text-right font-extrabold text-stone-900">
                    {formatPrice(unitPrice * item.quantity)}
                  </td>

                  {/* Actions */}
                  <td className="py-5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Actions */}
      <div className="p-4 bg-stone-50/60 border-t border-stone-200/80 flex items-center justify-between">
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Shopping Cart
        </button>
        <Link
          href="/products"
          className="text-xs font-bold text-stone-900 hover:text-indigo-600 transition-colors"
        >
          &larr; Continue Shopping
        </Link>
      </div>
    </div>
  );
}
