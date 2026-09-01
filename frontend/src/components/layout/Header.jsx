"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Search, User } from 'lucide-react';
import CategoryMenu from './CategoryMenu';
import LiveSearch from './LiveSearch';
import CurrencySwitcher from './CurrencySwitcher';
import AccountDropdown from './AccountDropdown';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { cartCount, openCart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F5F2EC] border-b border-stone-200/70 backdrop-blur-md text-stone-900 transition-colors">
      
      {/* Main Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        
        {/* Brand Logo (Left) */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="font-serif text-2xl font-bold tracking-[0.2em] text-stone-950 uppercase">
            LUXORA
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[12px] font-semibold tracking-widest text-stone-700 uppercase">
          <Link href="/" className="hover:text-stone-950 transition-colors">
            Home
          </Link>
          <Link href="/products" className="hover:text-stone-950 transition-colors">
            Shop
          </Link>
          
          {/* Categories Mega Menu */}
          <CategoryMenu />

          <Link href="/products?sort=latest" className="hover:text-stone-950 transition-colors whitespace-nowrap">
            New Arrivals
          </Link>
          <Link href="/products?featured=1" className="hover:text-stone-950 transition-colors">
            Offers
          </Link>
          <Link href="/about" className="hover:text-stone-950 transition-colors whitespace-nowrap">
            About Us
          </Link>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-5 shrink-0">
          
          {/* Live Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 text-stone-700 hover:text-stone-950 transition-colors"
            title="Search Products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Account Icon / Dropdown */}
          <AccountDropdown />

          {/* Cart Icon with Yellow Badge */}
          <button
            onClick={openCart}
            data-testid="cart-drawer-trigger"
            className="relative p-1.5 text-stone-700 hover:text-stone-950 transition-colors"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[10px] flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Live Search Bar */}
      {isSearchOpen && (
        <div className="bg-[#EFECE6] border-t border-stone-300/80 px-4 py-3 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <LiveSearch />
          </div>
        </div>
      )}
    </header>
  );
}
