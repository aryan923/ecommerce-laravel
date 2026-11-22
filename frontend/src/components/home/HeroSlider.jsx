"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchBanners } from '@/lib/cms-api';

const defaultSlides = [
  {
    id: 1,
    tag: 'GEN-Z ATELIER // EDITION 2026',
    title: 'The Streetwear Avant-Garde',
    titleHighlight: 'Edit',
    subtitle: 'Relaxed silhouettes, structured shoulders, and retro tinted eyewear engineered for contemporary urban poise.',
    primaryCtaText: 'Explore Streetwear',
    primaryCtaLink: '/products?category=men',
    secondaryCtaText: 'Shop Lookbook',
    secondaryCtaLink: '/products',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 2,
    tag: 'EDITORIAL RUNWAY // YOUTH COUTURE',
    title: 'Youthful Elegance & Bold',
    titleHighlight: 'Vibrancy',
    subtitle: 'Vibrant luxury mock-necks, high-waisted fluid tailoring, and unapologetic runway aesthetics defining the new generation.',
    primaryCtaText: 'Discover New Drops',
    primaryCtaLink: '/products?sort=latest',
    secondaryCtaText: 'Explore Couture',
    secondaryCtaLink: '/products?category=women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 3,
    tag: 'DECONSTRUCTED SUITING // LIMITED',
    title: 'Boxy Cuts & Relaxed',
    titleHighlight: 'Silhouettes',
    subtitle: 'Deconstructed blazers, wide-leg pleated trousers, and Swiss chronometers blending timeless atelier craft with Gen-Z flair.',
    primaryCtaText: 'Shop Tailored Street',
    primaryCtaLink: '/products?category=men',
    secondaryCtaText: 'View Bestsellers',
    secondaryCtaLink: '/products?sort=popular',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1600&q=85',
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadBanners() {
      const activeBanners = await fetchBanners('home_hero');
      if (activeBanners && activeBanners.length > 0) {
        const mapped = activeBanners.map((b, index) => {
          const fallback = defaultSlides[index % defaultSlides.length];
          return {
            id: b.id || index + 1,
            tag: b.placement && !b.placement.includes('home_hero') ? b.placement.replace('_', ' ').toUpperCase() : fallback.tag,
            title: b.title && !b.title.includes('Special Promotion') && !b.title.includes('Autumn Savings') ? b.title : fallback.title,
            titleHighlight: fallback.titleHighlight,
            subtitle: b.description || fallback.subtitle,
            primaryCtaText: b.button_text || fallback.primaryCtaText,
            primaryCtaLink: b.link_url || fallback.primaryCtaLink,
            secondaryCtaText: fallback.secondaryCtaText,
            secondaryCtaLink: fallback.secondaryCtaLink,
            image: (b.image_desktop && !b.image_desktop.includes('441986300917') && !b.image_desktop.includes('1584917865442'))
              ? b.image_desktop
              : fallback.image,
          };
        });
        setSlides(mapped);
      }
    }

    loadBanners();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const slide = slides[currentSlide] || defaultSlides[0];

  return (
    <section className="relative w-full bg-[#F5F2EC] text-stone-900 overflow-hidden border-b border-stone-200/80 py-10 sm:py-14 lg:py-16">
      
      {/* Full-width Edge-to-Edge Image on Right with Seamless Fade */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-2/3 z-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          {slides.map((s, idx) => (
            <Image
              key={s.id || idx}
              src={s.image}
              alt={s.title || "Gen-Z Luxury Fashion Hero"}
              fill
              priority={idx === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className={`object-cover object-center lg:object-right transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          {/* Smooth Linear Gradient Fade from solid background to transparent image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2EC] via-[#F5F2EC]/90 to-transparent w-full lg:w-4/5" />
          {/* Vertical Soft Edge Blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2EC]/80 via-transparent to-[#F5F2EC]/80" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F5F2EC] to-transparent" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="w-full max-w-2xl lg:max-w-3xl space-y-6 lg:space-y-8">
          
          {/* Tagline */}
          <span className="inline-block text-xs font-bold tracking-[0.25em] text-stone-500 uppercase">
            {slide.tag}
          </span>

          {/* Title */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal text-stone-950 leading-[1.06] tracking-tight">
            {slide.title}{' '}
            {slide.titleHighlight && (
              <span className="italic font-serif text-amber-800/85 font-normal block sm:inline">
                {slide.titleHighlight}
              </span>
            )}
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

            {slide.secondaryCtaLink && (
              <Link
                href={slide.secondaryCtaLink}
                className="bg-white/80 backdrop-blur-sm border border-stone-300 hover:bg-white text-stone-900 font-semibold text-sm sm:text-base px-8 py-4 rounded-xl transition-all duration-200 shadow-sm"
              >
                {slide.secondaryCtaText}
              </Link>
            )}
          </div>

          {/* Carousel Controls if multiple slides */}
          {slides.length > 1 && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-2 rounded-full border border-stone-300 bg-white/70 hover:bg-white text-stone-800 transition-all"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-stone-900' : 'w-2 bg-stone-300'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="p-2 rounded-full border border-stone-300 bg-white/70 hover:bg-white text-stone-800 transition-all"
                aria-label="Next Slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

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
