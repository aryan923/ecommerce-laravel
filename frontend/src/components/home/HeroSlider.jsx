"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchBanners } from '@/lib/cms-api';

const defaultSlides = [
  {
    id: 1,
    tag: 'EDITORIAL LOOKBOOK // CO-ED ATELIER',
    title: 'The Modern Vanguard',
    titleHighlight: 'Duo',
    subtitle: 'Synchronized tailoring, deconstructed streetwear, and avant-garde street poise redefining luxury fashion for the next generation.',
    primaryCtaText: 'Explore All Streetwear',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Shop Duo Lookbook',
    secondaryCtaLink: '/products?sort=latest',
    image: 'https://images.unsplash.com/photo-1683664794354-31b59f51e10c?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 2,
    tag: "MEN'S ATELIER // BOX SILHOUETTE",
    title: 'Deconstructed Suiting & Boxy',
    titleHighlight: 'Cuts',
    subtitle: 'Oversized blazers, wide-leg fluid trousers, and effortless poise blending atelier precision with Gen-Z urban edge.',
    primaryCtaText: "Shop Men's Edition",
    primaryCtaLink: '/products?category=men',
    secondaryCtaText: 'View Bestsellers',
    secondaryCtaLink: '/products?sort=popular',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 3,
    tag: "WOMEN'S RUNWAY // YOUTH COUTURE",
    title: 'Youthful Elegance & Bold',
    titleHighlight: 'Vibrancy',
    subtitle: 'High-fashion mock-necks, architectural high-waisted tailoring, and confident runway presence crafted for modern tastemakers.',
    primaryCtaText: "Shop Women's Drops",
    primaryCtaLink: '/products?category=women',
    secondaryCtaText: 'Discover Couture',
    secondaryCtaLink: '/products?sort=latest',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 4,
    tag: 'URBAN COUTURE // STREET STATEMENT',
    title: 'Structured Overcoats & Modern',
    titleHighlight: 'Layers',
    subtitle: 'Full-length tailored coats, textured monochrome layering, and raw urban confidence engineered for city streets.',
    primaryCtaText: 'Shop Outerwear',
    primaryCtaLink: '/products?category=men',
    secondaryCtaText: 'New Arrivals',
    secondaryCtaLink: '/products?sort=latest',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 5,
    tag: 'AVANT-GARDE // EDITION 2026',
    title: 'The Streetwear Avant-Garde',
    titleHighlight: 'Edit',
    subtitle: 'Oversized silhouettes, tactical accents, and dark retro eyewear engineered for unapologetic city style.',
    primaryCtaText: "Shop Women's Streetwear",
    primaryCtaLink: '/products?category=women',
    secondaryCtaText: 'Discover Drops',
    secondaryCtaLink: '/products?sort=latest',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
  },
  {
    id: 6,
    tag: 'MINIMALIST ATELIER // FLUID TAILORING',
    title: 'Relaxed Tailoring & Fluid',
    titleHighlight: 'Forms',
    subtitle: 'Sculptural oversized neutral suiting, clean lines, and relaxed luxury designed for understated everyday confidence.',
    primaryCtaText: 'Shop Neutral Tailoring',
    primaryCtaLink: '/products?category=women',
    secondaryCtaText: 'View Editorial',
    secondaryCtaLink: '/products',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1600&q=85',
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadBanners() {
      const activeBanners = await fetchBanners('home_hero');
      // Filter out stale seed/placeholder banners from the database
      const customBanners = (activeBanners || []).filter((b) => {
        const isStaleImage = b.image_desktop && (
          b.image_desktop.includes('1490481651871') ||
          b.image_desktop.includes('441986300917') ||
          b.image_desktop.includes('1584917865442') ||
          b.image_desktop.includes('1616486338812')
        );
        const isStaleTitle = b.title && (
          b.title.includes('Spring Elegance Collection') ||
          b.title.includes('Exclusive Autumn Savings') ||
          b.title.includes('Special Promotion')
        );
        return !isStaleImage && !isStaleTitle && b.image_desktop;
      });

      // If genuine custom CMS banners exist, prepend them ahead of default editorial slides
      if (customBanners.length > 0) {
        const mappedCustom = customBanners.map((b, idx) => ({
          id: b.id || `cms-${idx}`,
          tag: b.placement ? b.placement.replace('_', ' ').toUpperCase() : 'EDITORIAL DROP',
          title: b.title || 'Curated Contemporary Collection',
          titleHighlight: '',
          subtitle: b.description || 'Exclusive designer pieces curated for contemporary aesthetics.',
          primaryCtaText: b.button_text || 'Shop Now',
          primaryCtaLink: b.link_url || '/products',
          secondaryCtaText: 'View Lookbook',
          secondaryCtaLink: '/products?sort=latest',
          image: b.image_desktop,
        }));
        setSlides([...mappedCustom, ...defaultSlides]);
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
