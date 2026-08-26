"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/products', icon: Grid },
    { label: 'Wishlist', href: '/wishlist', icon: Heart },
    { label: 'Account', href: isAuthenticated ? '/account' : '/auth/login', icon: User },
  ];

  return (
    <div
      data-testid="mobile-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 py-2 px-4"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Cart Trigger */}
        <button
          onClick={openCart}
          className="flex flex-col items-center gap-1 text-zinc-400 hover:text-zinc-200 relative transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
      </div>
    </div>
  );
}
