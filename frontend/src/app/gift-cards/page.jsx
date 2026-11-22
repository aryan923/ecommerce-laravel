"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gift, Sparkles, Check, Copy, ArrowRight, ShieldCheck, Heart, CreditCard } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import Breadcrumbs from '@/components/common/Breadcrumbs';

const denominations = [2500, 5000, 10000, 25000];

export default function GiftCardsPage() {
  const { formatPrice } = useCurrency();
  const { addItem, openCart } = useCart();
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!finalAmount || finalAmount < 500) return;

    setIsAdding(true);
    try {
      if (addItem) {
        await addItem({
          id: 99901,
          product_id: 99901,
          name: `LUXORA Maison Digital Gift Card (${formatPrice(finalAmount)})`,
          price: finalAmount,
          unit_price: finalAmount,
          quantity: 1,
          slug: 'luxora-maison-gift-card',
          image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
          recipient: recipientName,
          recipient_email: recipientEmail,
        }, 1);
      }
      setIsAdded(true);
      if (openCart) openCart();
      setTimeout(() => setIsAdded(false), 3000);
    } catch (err) {
      console.warn("Gift card add error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Gift Cards' },
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-stone-900 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10">
            <Gift className="w-3.5 h-3.5 text-amber-800" />
            <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
              The Gift of Choice
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 tracking-tight">
            LUXORA Maison Gift Cards
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Delivered instantly by email with personalized greetings, valid across our entire curated luxury collection without expiration.
          </p>
        </div>

        {/* 2-Column Split: Card Visual & Purchase Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Digital Gift Card Visual */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-7 text-white shadow-2xl border border-stone-800 flex flex-col justify-between group">
              {/* Background Texture & Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-amber-300/10 pointer-events-none" />
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              {/* Card Top Row */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="font-serif text-xl font-bold tracking-[0.2em] text-white uppercase">
                  LUXORA
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Maison Card
                </span>
              </div>

              {/* Card Center: Amount Display */}
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 block">
                  Gift Card Value
                </span>
                <p className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                  {formatPrice(finalAmount)}
                </p>
                {recipientName && (
                  <p className="text-xs text-stone-300 font-medium italic truncate">
                    For {recipientName}
                  </p>
                )}
              </div>

              {/* Card Bottom Row */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-stone-400 font-mono border-t border-white/10 pt-3">
                <span>DIGITAL EDITION</span>
                <span>NO EXPIRY DATE</span>
              </div>
            </div>

            {/* Perks Under Card */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-2.5 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold text-stone-700">100% Guaranteed</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-2.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-semibold text-stone-700">Instant Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-sm space-y-6">
            
            {/* Amount Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                1. Select Denomination
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {denominations.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 border ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-stone-950 text-white border-stone-950 shadow-md ring-2 ring-stone-950/20'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    {formatPrice(amt)}
                  </button>
                ))}
              </div>

              {/* Custom Amount Field */}
              <div className="mt-3">
                <input
                  type="number"
                  min="500"
                  max="100000"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  placeholder="Or enter custom amount (Min. ₹500)"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
                />
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-4 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Recipient Information
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Wishing you unforgettable moments of luxury..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 resize-none"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || finalAmount < 500}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-950 hover:bg-amber-800 text-white disabled:opacity-50'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart ({formatPrice(finalAmount)})</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{isAdding ? 'Adding...' : `Acquire Gift Card • ${formatPrice(finalAmount)}`}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
