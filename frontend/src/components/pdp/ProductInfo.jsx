"use client";

import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import StockBadge from './StockBadge';

export default function ProductInfo({ product = {}, selectedVariant = null }) {
  const { formatPrice } = useCurrency();

  const brandName = product.brand?.name || product.brand_name || 'Luxora Collection';
  const brandSlug = product.brand?.slug;
  const categoryName = product.category?.name || product.category_name;
  const categorySlug = product.category?.slug;

  const currentPrice = selectedVariant?.price || product.price || 0;
  const originalPrice = selectedVariant?.compare_at_price || product.compare_at_price || product.original_price;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const sku = selectedVariant?.sku || product.sku || 'SKU-LX-1001';
  const rating = product.rating || product.average_rating || 4.8;
  const reviewCount = product.reviews_count || product.total_reviews || 24;

  const stockQuantity = selectedVariant ? selectedVariant.stock_quantity : (product.stock_quantity ?? product.stock ?? 15);

  return (
    <div data-testid="product-info" className="flex flex-col gap-4">
      {/* Category & Brand Header Tag */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
        {brandSlug ? (
          <Link
            data-testid="product-brand"
            href={`/brand/${brandSlug}`}
            className="hover:text-amber-800 transition-colors"
          >
            {brandName}
          </Link>
        ) : (
          <span data-testid="product-brand">{brandName}</span>
        )}
        {categoryName && (
          <>
            <span>•</span>
            {categorySlug ? (
              <Link href={`/category/${categorySlug}`} className="hover:text-amber-800 transition-colors">
                {categoryName}
              </Link>
            ) : (
              <span>{categoryName}</span>
            )}
          </>
        )}
      </div>

      {/* Product Title */}
      <h1 data-testid="product-title" className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
        {product.name || product.title || 'Luxora Product Title'}
      </h1>

      {/* Rating & SKU Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2">
          <div data-testid="product-rating" className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
          <a href="#reviews-section" className="text-stone-500 hover:text-stone-900 font-medium underline underline-offset-2">
            ({reviewCount} customer reviews)
          </a>
        </div>

        <div className="flex items-center gap-3">
          <StockBadge stockQuantity={stockQuantity} />
          <span data-testid="product-sku" className="text-stone-400 font-mono text-[11px]">
            SKU: {sku}
          </span>
        </div>
      </div>

      {/* Price Block */}
      <div className="flex items-baseline gap-3 pt-1">
        <span data-testid="product-price" className="text-3xl font-black text-stone-950 tracking-tight">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg font-semibold text-stone-400 line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
              Save {discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Short Description */}
      {product.short_description && (
        <p className="text-sm text-stone-600 leading-relaxed">
          {product.short_description}
        </p>
      )}

      {/* Trust Highlight Pill */}
      <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200/70 rounded-xl text-xs text-stone-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Authentic Product Guaranteed • 100% Secure Checkout</span>
      </div>
    </div>
  );
}
