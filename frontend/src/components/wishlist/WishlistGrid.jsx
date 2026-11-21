"use client";

import React from 'react';
import WishlistCard from './WishlistCard';

export default function WishlistGrid({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      data-testid="wishlist-grid"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
    >
      {items.map((item) => (
        <WishlistCard key={item.id || item.product_id} item={item} />
      ))}
    </div>
  );
}

