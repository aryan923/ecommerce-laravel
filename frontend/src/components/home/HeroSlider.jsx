"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const slides = [
  {
    id: 1,
    tag: 'NEW COLLECTION 2024',
    title: 'Discover Things You’ll',
    titleHighlight: 'Love',
    subtitle: 'Thoughtfully selected products, beautiful designs, and everyday essentials—all in one place.',
    primaryCtaText: 'Shop New Arrivals',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/products?featured=1',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 2,
    tag: 'LIMITED EDITION 2024',
    title: 'Elevate Your Everyday',
    titleHighlight: 'Style',
    subtitle: 'Crafted with premium materials for timeless comfort and understated elegance.',
    primaryCtaText: 'Explore Collection',
    primaryCtaLink: '/products',
    secondaryCtaText: 'View Bestsellers',
    secondaryCtaLink: '/products?sort=popular',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full bg-[#F5F2EC] text-stone-900 overflow-hidden border-b border-stone-200/80 pt-6 pb-12 lg:pt-10 lg:pb-16">
      
      {/* Full-width Edge-to-Edge Image on Right with Seamless Fade */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-2/3 z-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={slide.image}
            alt="Luxury Lifestyle Hero"
            fill
            priority
            className="object-cover object-center lg:object-right transition-opacity duration-1000"
          />
          {/* Smooth Linear Gradient Fade from solid background to transparent image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2EC] via-[#F5F2EC]/90 to-transparent w-full lg:w-4/5" />
          {/* Vertical Soft Edge Blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2EC]/80 via-transparent to-[#F5F2EC]/80" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F5F2EC] to-transparent" />
        </div>
      </div>

      {/* Main Content Container (Starts higher up to eliminate top empty space) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="w-full max-w-2xl lg:max-w-3xl space-y-6 lg:space-y-8">
          
          {/* Tagline */}
          <span className="inline-block text-xs font-bold tracking-[0.25em] text-stone-500 uppercase">
            {slide.tag}
          </span>

          {/* Larger Luxury Editorial Serif Title */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal text-stone-950 leading-[1.06] tracking-tight">
            {slide.title}{' '}
            <span className="italic font-serif text-amber-800/85 font-normal block sm:inline">
              {slide.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-stone-650 text-base sm:text-lg leading-relaxed max-w-xl">
            {slide.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href={slide.primaryCtaLink}
              className="bg-[#18181B] hover:bg-stone-950 text-white font-semibold text-sm sm:text-base px-8 py-4 rounded-xl transition-all duration-200 shadow-md flex items-center gap-2.5"
            >
              <span>{slide.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            <Link
              href={slide.secondaryCtaLink}
              className="bg-white/80 backdrop-blur-sm border border-stone-300 hover:bg-white text-stone-900 font-semibold text-sm sm:text-base px-8 py-4 rounded-xl transition-all duration-200 shadow-sm"
            >
              {slide.secondaryCtaText}
            </Link>
          </div>

          {/* Integrated Mini Trust Badges */}
          <div className="pt-8 border-t border-stone-300/60 grid grid-cols-3 gap-4 text-left max-w-2xl">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-stone-700 shrink-0" />
              <div>
                <h6 className="text-xs font-bold text-stone-900">Free Shipping</h6>
                <p className="text-[11px] text-stone-500">On orders over $50</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-stone-700 shrink-0" />
              <div>
                <h6 className="text-xs font-bold text-stone-900">Easy Returns</h6>
                <p className="text-[11px] text-stone-500">30 days return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-stone-700 shrink-0" />
              <div>
                <h6 className="text-xs font-bold text-stone-900">Secure Payment</h6>
                <p className="text-[11px] text-stone-500">100% secure checkout</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
