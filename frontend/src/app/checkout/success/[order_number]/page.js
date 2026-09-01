import React, { Suspense } from 'react';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export const metadata = {
  title: 'Order Confirmation | E-Commerce Storefront',
  description: 'View your order confirmation receipt and shipment tracking details.',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 animate-pulse" />}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
