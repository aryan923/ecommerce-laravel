import React, { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Express Checkout | E-Commerce Storefront',
  description: 'Complete your purchase securely with instant shipping calculation and payment options.',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 animate-pulse" />}>
      <CheckoutClient />
    </Suspense>
  );
}
