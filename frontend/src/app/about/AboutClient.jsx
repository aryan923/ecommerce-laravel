"use client";

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, HeartHandshake, Sparkles, ArrowRight, Users, Globe2, Truck } from 'lucide-react';

export default function AboutClient() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
          Our Craft & Story
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
          Redefining Modern Luxury Commerce
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Founded in 2024, Luxora bridges timeless craftsmanship with modern digital innovation—curating premium lifestyle essentials engineered for elegance, durability, and daily delight.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-stone-900 text-white rounded-2xl shadow-md">
        <div className="text-center space-y-1 border-r border-stone-800 last:border-0">
          <p className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">150K+</p>
          <p className="text-xs uppercase tracking-wider text-stone-400">Happy Customers</p>
        </div>
        <div className="text-center space-y-1 border-r border-stone-800 last:border-0">
          <p className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">50+</p>
          <p className="text-xs uppercase tracking-wider text-stone-400">Countries Served</p>
        </div>
        <div className="text-center space-y-1 border-r border-stone-800 last:border-0">
          <p className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">99.8%</p>
          <p className="text-xs uppercase tracking-wider text-stone-400">On-Time Delivery</p>
        </div>
        <div className="text-center space-y-1">
          <p className="font-serif text-3xl sm:text-4xl font-bold text-amber-400">4.9/5</p>
          <p className="text-xs uppercase tracking-wider text-stone-400">Customer Rating</p>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            What Sets Luxora Apart
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Our unyielding commitment to quality, transparency, and sustainable luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Uncompromised Quality</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every product in our catalog undergoes rigorous 20-point quality verification, ensuring grade-A materials and authentic artisan construction.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Ethical Sourcing</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We partner directly with certified workshops that respect worker rights, fair wages, and sustainable environmental standards.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Customer Obsession</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              From seamless checkout and 30-day effortless returns to 24/7 dedicated support, we prioritize your satisfaction above all else.
            </p>
          </div>
        </div>
      </div>

      {/* Leadership / Brand CTA */}
      <div className="p-8 sm:p-12 bg-stone-100 rounded-3xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Ready to Experience Luxora?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md">
            Explore our latest collections and elevate your everyday lifestyle essentials today.
          </p>
        </div>
        <Link
          href="/products"
          className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm inline-flex items-center gap-2 shrink-0"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
