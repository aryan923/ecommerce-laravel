"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Share2, Globe, MapPin, Phone } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to Luxora newsletter!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#111111] text-stone-300 text-xs">
      
      {/* Top Newsletter Card Section */}
      <div className="bg-[#FAF9F5] text-stone-900 py-12 px-4 border-t border-b border-stone-200/80 text-center relative">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Centered Circle Icon Badge */}
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E5DFD3] flex items-center justify-center text-stone-800 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
            Stay in the Know
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm">
            Get updates on new arrivals, exclusive offers, and more.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full bg-white border border-stone-300 px-4 py-3 text-stone-900 text-xs rounded-lg placeholder-stone-400 focus:outline-none focus:border-stone-800"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#18181B] hover:bg-stone-900 text-white font-medium text-xs px-6 py-3 rounded-lg transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Grid (5 Columns) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" className="inline-block">
            <span className="font-serif text-xl font-bold tracking-[0.2em] text-white uppercase">
              LUXORA
            </span>
          </Link>
          <p className="text-stone-400 leading-relaxed text-[11px]">
            Elevating the way you shop with quality, style & trust.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2 text-stone-400">
            <a href="#" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center hover:text-white hover:bg-stone-700 transition-colors" title="Share">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center hover:text-white hover:bg-stone-700 transition-colors" title="Website">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Shop */}
        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-4">Shop</h5>
          <ul className="space-y-2 text-stone-400 text-[11px]">
            <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href="/products?sort=latest" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link href="/products?sort=popular" className="hover:text-white transition-colors">Best Sellers</Link></li>
            <li><Link href="/products?featured=1" className="hover:text-white transition-colors">Offers</Link></li>
            <li><Link href="/gift-cards" className="hover:text-white transition-colors">Gift Cards</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Care */}
        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-4">Customer Care</h5>
          <ul className="space-y-2 text-stone-400 text-[11px]">
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
          </ul>
        </div>

        {/* Column 4: About Us */}
        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-4">About Us</h5>
          <ul className="space-y-2 text-stone-400 text-[11px]">
            <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* Column 5: Contact Us */}
        <div>
          <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-4">Contact Us</h5>
          <ul className="space-y-2.5 text-stone-400 text-[11px]">
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>support@luxora.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>+1 (123) 456-7890</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
              <span>123, Fashion Street,<br />New York, NY 10001</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="border-t border-stone-800 py-6 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          
          {/* Payment Badges */}
          <div className="flex items-center gap-3 text-stone-400 font-semibold text-[10px]">
            <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded">VISA</span>
            <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded">Mastercard</span>
            <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded">PayPal</span>
            <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded">Apple Pay</span>
            <span className="bg-stone-900 border border-stone-800 px-2 py-1 rounded">Google Pay</span>
          </div>

          {/* Copyright */}
          <p>© 2024 Luxora. All Rights Reserved.</p>

        </div>
      </div>
    </footer>
  );
}
