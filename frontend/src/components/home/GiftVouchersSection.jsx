"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Gift, Tag, Check, Copy, Sparkles, ArrowRight, ShieldCheck, Percent, Truck } from 'lucide-react';

const vouchers = [
  {
    id: 'welcome20',
    code: 'WELCOME20',
    title: 'Welcome Privilege Pass',
    badge: '20% OFF',
    badgeType: 'gold',
    discount: '20% OFF',
    minSpend: 'Min. spend ₹1,999',
    description: 'Enjoy 20% savings on your inaugural order across our entire curated luxury collection.',
    validity: 'Valid for new registered members',
    icon: Percent,
    accentColor: 'from-amber-500/15 to-amber-600/5',
    borderColor: 'border-amber-400/40',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'luxegift',
    code: 'LUXEGIFT',
    title: 'Curator’s Luxury Gift Box',
    badge: 'FREE GIFT',
    badgeType: 'emerald',
    discount: 'FREE GIFT',
    minSpend: 'Orders above ₹4,999',
    description: 'Receive a complimentary handcrafted scented candle & velvet keepsake travel pouch.',
    validity: 'Auto-included with eligible orders',
    icon: Gift,
    accentColor: 'from-emerald-500/15 to-emerald-600/5',
    borderColor: 'border-emerald-400/40',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    id: 'freeship',
    code: 'FREESHIP',
    title: 'VIP Concierge Express Pass',
    badge: 'FREE SHIPPING',
    badgeType: 'stone',
    discount: 'ZERO FEE',
    minSpend: 'No minimum threshold',
    description: 'Complimentary priority white-glove courier dispatch with full insurance and live tracking.',
    validity: 'All luxury timepieces & apparel',
    icon: Truck,
    accentColor: 'from-stone-800/10 to-stone-900/5',
    borderColor: 'border-stone-400/40',
    badgeBg: 'bg-stone-200 text-stone-900 border-stone-300',
  },
];

export default function GiftVouchersSection() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2800);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
              <Gift className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Exclusive Member Privileges
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Gift Vouchers &amp; Passes
            </h2>
            <p className="text-xs text-stone-500 max-w-lg mt-1 font-medium">
              Claim privileged vouchers for your next acquisition. Tap any voucher pass to copy its code directly to your checkout bag.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400">
              Auto-verified codes for November 2026
            </span>
          </div>
        </div>

        {/* 3-Column Ticket / Voucher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {vouchers.map((v) => {
            const isCopied = copiedCode === v.code;
            const Icon = v.icon;

            return (
              <div
                key={v.id}
                className="relative flex flex-col justify-between bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
              >
                {/* Top Subtle Gradient Glow */}
                <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${v.accentColor}`} />

                {/* Voucher Main Body */}
                <div className="p-6 sm:p-7 space-y-4">
                  
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${v.badgeBg}`}>
                      <Sparkles className="w-3 h-3" />
                      <span>{v.badge}</span>
                    </span>

                    <div className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Voucher Name & Value */}
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                      {v.title}
                    </h3>
                    <p className="text-2xl font-black text-stone-950 tracking-tight mt-1">
                      {v.discount}
                    </p>
                    <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                      {v.minSpend}
                    </p>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {v.description}
                  </p>

                  <div className="pt-2 text-[10px] text-stone-400 font-semibold border-t border-stone-100">
                    <span>{v.validity}</span>
                  </div>
                </div>

                {/* Perforated Coupon Cutouts & Dashed Divider */}
                <div className="relative py-1">
                  {/* Left Ticket Notch */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF9F6] border-r border-stone-200/90" />
                  {/* Right Ticket Notch */}
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF9F6] border-l border-stone-200/90" />
                  {/* Dashed Line */}
                  <div className="mx-6 border-t-2 border-dashed border-stone-200/90" />
                </div>

                {/* Voucher Tear-Off Stub (Bottom Action Section) */}
                <div className="p-5 sm:p-6 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-3">
                  
                  {/* Coupon Code Block */}
                  <div className="flex-1 min-w-0">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
                      Voucher Code
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-stone-900 select-all">
                      {v.code}
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(v.code)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all duration-200 shadow-sm active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-900 hover:bg-amber-800 text-white'
                    }`}
                    title="Copy code to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner Note */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-100">
                100% Guaranteed Voucher Redemption at Checkout
              </p>
              <p className="text-[11px] text-stone-400">
                Simply paste the copied promo code into the voucher box before payment to redeem instant savings.
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
          >
            <span>Shop With Voucher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
