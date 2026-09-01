"use client";

import React from 'react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import CartTable from '../../components/cart/CartTable';
import CouponForm from '../../components/cart/CouponForm';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard';
import EmptyCartView from '../../components/cart/EmptyCartView';
import { useCart } from '../../context/CartContext';

export default function CartClient() {
  const { items, isLoading } = useCart();

  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    { label: 'Shopping Cart' },
  ];

  const isEmpty = !items || items.length === 0;

  return (
    <div data-testid="cart-page" className="min-h-screen bg-stone-50/40 text-stone-900 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Trail */}
        <div className="mb-2.5">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Heading */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Review your selected items, apply promo codes, and proceed to checkout.
          </p>
        </div>

        {/* Conditional Layout */}
        {isEmpty && !isLoading ? (
          <EmptyCartView />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items & Coupon Form */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <CartTable />
              <CouponForm />
            </div>

            {/* Right Column: Order Financial Summary Card */}
            <div className="lg:col-span-5">
              <OrderSummaryCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
