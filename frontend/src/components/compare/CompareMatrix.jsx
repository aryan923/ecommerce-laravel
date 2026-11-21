"use client";

import React from 'react';
import Link from 'next/link';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { X, ShoppingBag, Star, CheckCircle, XCircle } from 'lucide-react';

export default function CompareMatrix({ highlightDiffs = false }) {
  const { comparedProducts, removeFromCompare } = useCompare();
  const { addItem, closeCart } = useCart();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  if (!comparedProducts || comparedProducts.length === 0) return null;

  // Extract all unique attribute keys across all products
  const attributeKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) =>
        p.attributes ? Object.keys(p.attributes) : []
      )
    )
  );

  const handleAddToCart = async (product) => {
    await addItem(product, 1);
    closeCart();
    showToast(`Added "${product.title || product.name}" to cart`, 'success');
  };

  // Helper to determine if an attribute row has identical values across all compared products
  const isRowIdentical = (key) => {
    if (comparedProducts.length <= 1) return true;
    const firstVal = (comparedProducts[0].attributes || {})[key];
    return comparedProducts.every((p) => (p.attributes || {})[key] === firstVal);
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[700px] border-collapse text-left">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            {/* Attribute Header Column */}
            <th className="p-4 w-48 text-xs font-bold uppercase tracking-wider text-stone-500 sticky left-0 bg-stone-50 z-10 border-r border-stone-200">
              Product Spec
            </th>

            {/* Product Columns */}
            {comparedProducts.map((product) => (
              <th
                key={product.id}
                className="p-4 w-64 min-w-[200px] text-center border-r border-stone-200 last:border-r-0 align-top"
              >
                <div className="relative group flex flex-col items-center">
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCompare(product)}
                    data-testid="remove-matrix-item-btn"
                    className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Thumbnail Image */}
                  <div className="w-28 h-28 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden mb-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="font-bold text-xs sm:text-sm text-stone-900 hover:text-amber-800 transition-colors line-clamp-2 text-center"
                  >
                    {product.title}
                  </Link>

                  {/* Brand Tag */}
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mt-1">
                    {product.brand}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-stone-200 text-xs text-stone-800">
          
          {/* Price & Discount Row */}
          <tr>
            <td className="p-4 font-bold text-stone-700 uppercase tracking-wider text-[11px] sticky left-0 bg-stone-50 border-r border-stone-200">
              Price
            </td>
            {comparedProducts.map((product) => (
              <td key={product.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-extrabold text-sm text-stone-950">
                    {formatPrice(product.price)}
                  </span>
                  {product.original_price > product.price && (
                    <div className="flex items-center gap-1.5">
                      <span className="line-through text-stone-400 text-[11px]">
                        {formatPrice(product.original_price)}
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded">
                        -{product.discount_percent}%
                      </span>
                    </div>
                  )}
                </div>
              </td>
            ))}
          </tr>

          {/* Rating & Reviews Row */}
          <tr>
            <td className="p-4 font-bold text-stone-700 uppercase tracking-wider text-[11px] sticky left-0 bg-stone-50 border-r border-stone-200">
              Rating & Reviews
            </td>
            {comparedProducts.map((product) => (
              <td key={product.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                <div className="inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-900">{product.rating}</span>
                  <span className="text-stone-400 font-medium text-[10px]">({product.reviews_count})</span>
                </div>
              </td>
            ))}
          </tr>

          {/* Stock Status Row */}
          <tr>
            <td className="p-4 font-bold text-stone-700 uppercase tracking-wider text-[11px] sticky left-0 bg-stone-50 border-r border-stone-200">
              Availability
            </td>
            {comparedProducts.map((product) => (
              <td key={product.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                {product.in_stock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold rounded-full text-[11px]">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>In Stock ({product.stock_qty || 8} left)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 font-semibold rounded-full text-[11px]">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span>Out of Stock</span>
                  </span>
                )}
              </td>
            ))}
          </tr>

          {/* Dynamic Technical Attributes Rows */}
          {attributeKeys.map((key) => {
            const isIdentical = isRowIdentical(key);
            if (highlightDiffs && isIdentical) return null;

            return (
              <tr key={key} className={highlightDiffs && !isIdentical ? 'bg-amber-50/40' : ''}>
                <td className="p-4 font-bold text-stone-700 uppercase tracking-wider text-[11px] sticky left-0 bg-stone-50 border-r border-stone-200">
                  {key}
                </td>
                {comparedProducts.map((product) => (
                  <td key={product.id} className="p-4 text-center border-r border-stone-200 last:border-r-0 text-stone-700 font-medium">
                    {(product.attributes && product.attributes[key]) || 'N/A'}
                  </td>
                ))}
              </tr>
            );
          })}

          {/* Direct Action Row */}
          <tr className="bg-stone-50">
            <td className="p-4 font-bold text-stone-700 uppercase tracking-wider text-[11px] sticky left-0 bg-stone-50 border-r border-stone-200">
              Action
            </td>
            {comparedProducts.map((product) => (
              <td key={product.id} className="p-4 text-center border-r border-stone-200 last:border-r-0">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.in_stock}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-amber-800 disabled:bg-stone-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </td>
            ))}
          </tr>

        </tbody>
      </table>
    </div>
  );
}
