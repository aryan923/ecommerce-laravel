"use client";

import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import AccountSidebar from '../../components/account/AccountSidebar';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import WishlistHeader from '../../components/wishlist/WishlistHeader';
import WishlistGrid from '../../components/wishlist/WishlistGrid';
import EmptyWishlist from '../../components/wishlist/EmptyWishlist';

export default function WishlistClient() {
  const { wishlistItems, wishlistCount, isLoading } = useWishlist();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    { label: 'My Account', href: '/account' },
    { label: 'My Wishlist' },
  ];

  if (isLoading || authLoading) {
    return (
      <div data-testid="wishlist-page" className="min-h-screen bg-stone-50/40 text-stone-900 py-6 sm:py-8 my-4">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-3">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <AccountSidebar />
            <main className="flex-1 min-w-0 w-full animate-pulse space-y-4">
              <div className="h-8 bg-stone-200/80 rounded-xl w-64 mb-2"></div>
              <div className="h-4 bg-stone-200/60 rounded-lg w-96 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-stone-200/60 rounded-2xl h-80"></div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="wishlist-page" className="min-h-screen bg-stone-50/40 text-stone-900 py-6 sm:py-8 my-4">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-3">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <AccountSidebar />
          <main className="flex-1 min-w-0 w-full space-y-6">
            <WishlistHeader itemCount={wishlistCount} />

            {wishlistCount > 0 ? (
              <WishlistGrid items={wishlistItems} />
            ) : (
              <EmptyWishlist />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

