import React from 'react';
import CartClient from './CartClient';

export const metadata = {
  title: 'Shopping Cart | E-Commerce Storefront',
  description: 'View your shopping cart items, apply promotional discount coupons, and proceed to secure checkout.',
};

export default function CartPage() {
  return <CartClient />;
}
