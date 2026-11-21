import React from 'react';
import WishlistClient from './WishlistClient';

export const metadata = {
  title: 'My Wishlist | LUXORA Luxury Storefront',
  description: 'View and manage your saved luxury products, track availability, and transfer items to your shopping cart.',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
