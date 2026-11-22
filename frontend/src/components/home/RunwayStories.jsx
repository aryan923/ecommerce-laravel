"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Sparkles, ArrowRight, ShoppingBag, Eye, Volume2, VolumeX } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const stories = [
  {
    id: 'new-drops',
    label: 'New Drops',
    badge: 'NEW',
    category: 'Runway Edition',
    title: 'Winter Runway Drop 01',
    subtitle: 'Limited seasonal capsule fresh from Paris Fashion Week.',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Luxury Silk Evening Dress',
      price: 380,
      slug: 'luxury-silk-evening-dress',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'horology',
    label: 'Horology',
    badge: 'SWISS',
    category: 'Fine Timepieces',
    title: 'Precision Horology Suite',
    subtitle: 'Swiss automatic chronometers assembled with scratch-resistant sapphire crystal.',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Classic Chronometer Watch',
      price: 890,
      slug: 'classic-chronometer-watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'suiting',
    label: 'Atelier Suiting',
    badge: 'HOT',
    category: 'Men\'s Couture',
    title: 'Midnight Avant-Garde',
    subtitle: 'Italian virgin wool tailoring with satin-silk peak lapels.',
    thumbnail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Satin-Lapel Tailored Dinner Jacket',
      price: 640,
      slug: 'satin-lapel-tailored-dinner-jacket',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'leathercraft',
    label: 'Leathercraft',
    badge: 'TUSCAN',
    category: 'Artisanal Bags',
    title: 'Tuscan Vegetable Leather',
    subtitle: 'Hand-burnished full-grain calfskin totes with suede security interior.',
    thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Artisanal Leather Tote',
      price: 275,
      slug: 'artisanal-leather-tote',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'eyewear',
    label: 'Eyewear',
    badge: 'TITANIUM',
    category: 'Accessories',
    title: 'Japanese Titanium Aviators',
    subtitle: 'Gradient tinted UV400 lenses with precision-screwed hinges.',
    thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Retro Tinted Aviator Sunglasses',
      price: 185,
      slug: 'retro-tinted-aviator-sunglasses',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
    },
  },
  {
    id: 'cashmere',
    label: 'Knitwear',
    badge: 'PURE',
    category: 'Winter Layers',
    title: 'Mongolian Grade-A Cashmere',
    subtitle: 'Cloudweight 2-ply spun cashmere designed for effortless warmth.',
    thumbnail: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Cashmere Knit Sweater',
      price: 290,
      slug: 'cashmere-knit-sweater',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'jewelry',
    label: 'Fine Jewelry',
    badge: '18K',
    category: 'Maison Gold',
    title: 'Solitaire Diamond Necklaces',
    subtitle: 'Conflict-free brilliant cut diamonds set in 18k solid yellow gold.',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Diamond Pendant Necklace',
      price: 1250,
      slug: 'diamond-pendant-necklace',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'shirting',
    label: 'Silk Shirts',
    badge: 'EXCLUSIVE',
    category: 'Formalwear',
    title: 'Silk-Cotton Evening Shirting',
    subtitle: 'Mulberry silk and Egyptian cotton weave with hidden placket.',
    thumbnail: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
    fullImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1080&q=80',
    product: {
      name: 'Monogram Silk-Cotton Fitted Black Shirt',
      price: 160,
      slug: 'monogram-silk-cotton-fitted-black-shirt',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80',
    },
  },
];

export default function RunwayStories() {
  const { formatPrice } = useCurrency();
  const scrollRef = useRef(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Scroll controls for the horizontal ribbon
  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Story Timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const interval = 50; // update progress every 50ms
    const totalDuration = 5000; // 5 seconds per story
    const increment = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close if last
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((idx) => idx + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryIndex, isPaused]);

  // Open Story modal
  const openStory = (index) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);
  };

  // Close Story modal
  const closeStory = () => {
    setActiveStoryIndex(null);
    setProgress(0);
  };

  // Next / Prev within modal
  const nextStory = () => {
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <section className="py-6 sm:py-8 bg-[#FAF9F6] border-b border-stone-200/60 relative">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Section Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">
              Runway Stories &amp; Daily Highlights
            </span>
          </div>

          <span className="text-[10px] text-stone-400 font-medium hidden sm:inline-block">
            Tap to preview live backstage edits
          </span>
        </div>

        {/* Stories Horizontal Ribbon Container */}
        <div className="relative group/ribbon">
          
          {/* Left Arrow Button */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-stone-300/80 shadow-md items-center justify-center text-stone-700 hover:text-stone-950 hover:scale-105 transition-all z-10 opacity-0 group-hover/ribbon:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 border border-stone-300/80 shadow-md items-center justify-center text-stone-700 hover:text-stone-950 hover:scale-105 transition-all z-10 opacity-0 group-hover/ribbon:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Scrollable Story Avatars */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => openStory(index)}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none cursor-pointer"
              >
                {/* Gold Gradient Ring Avatar */}
                <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 group-hover:from-amber-500 group-hover:to-rose-400 transition-all duration-300 group-hover:scale-105 shadow-sm">
                  
                  {/* Inner White Space Ring */}
                  <div className="p-[2px] bg-white rounded-full">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-stone-100">
                      <Image
                        src={story.thumbnail}
                        alt={story.label}
                        fill
                        sizes="72px"
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Micro Badge */}
                  {story.badge && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black tracking-wider uppercase bg-stone-900 text-amber-300 border border-white/40 shadow-xs">
                      {story.badge}
                    </span>
                  )}
                </div>

                {/* Story Label */}
                <span className="text-[11px] font-bold text-stone-700 group-hover:text-stone-950 transition-colors tracking-tight text-center max-w-[76px] truncate">
                  {story.label}
                </span>
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Full-Screen Interactive Runway Story Modal */}
      {activeStoryIndex !== null && currentStory && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={closeStory}
        >
          {/* Modal Container */}
          <div
            className="relative w-full sm:max-w-md h-full sm:h-[85vh] sm:max-h-[760px] bg-stone-950 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Background Story Photo */}
            <Image
              src={currentStory.fullImage}
              alt={currentStory.title}
              fill
              priority
              className="object-cover object-center filter brightness-[0.88] contrast-[1.05]"
            />

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-stone-950/60 pointer-events-none" />

            {/* Left/Right Tap Navigation Zones */}
            <div className="absolute inset-y-16 inset-x-0 flex z-10">
              <div
                className="w-1/2 h-full cursor-w-resize"
                onClick={prevStory}
                title="Previous Story"
              />
              <div
                className="w-1/2 h-full cursor-e-resize"
                onClick={nextStory}
                title="Next Story"
              />
            </div>

            {/* Top Bar: Progress Bars + Author Info + Close */}
            <div className="relative z-20 p-4 space-y-3">
              
              {/* Multi-story Segment Progress Bar */}
              <div className="flex items-center gap-1.5">
                {stories.map((s, idx) => (
                  <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          idx < activeStoryIndex
                            ? '100%'
                            : idx === activeStoryIndex
                            ? `${progress}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header Details */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/40">
                    <Image
                      src={currentStory.thumbnail}
                      alt={currentStory.label}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      <span>LUXORA RUNWAY</span>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </p>
                    <p className="text-[10px] text-stone-300 font-mono">
                      {currentStory.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={closeStory}
                    className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                    aria-label="Close story"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Content Area: Story Title & Tagged Product Card */}
            <div className="relative z-20 p-5 space-y-4">
              
              {/* Story Narrative */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  {currentStory.badge} • Capsule Focus
                </span>
                <h3 className="font-serif text-2xl font-normal text-white leading-tight mt-0.5">
                  {currentStory.title}
                </h3>
                <p className="text-xs text-stone-300 mt-1 font-light leading-relaxed">
                  {currentStory.subtitle}
                </p>
              </div>

              {/* Tagged Product Mini Card */}
              {currentStory.product && (
                <div className="bg-stone-950/80 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-between gap-3 shadow-xl">
                  
                  {/* Product Thumbnail */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-white/10">
                    <Image
                      src={currentStory.product.image}
                      alt={currentStory.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                      Featured Piece
                    </p>
                    <p className="text-xs font-bold text-white truncate">
                      {currentStory.product.name}
                    </p>
                    <p className="text-xs font-extrabold text-amber-300 mt-0.5">
                      {formatPrice ? formatPrice(currentStory.product.price) : `₹${currentStory.product.price}`}
                    </p>
                  </div>

                  {/* View Product CTA Link */}
                  <Link
                    href={`/products/${currentStory.product.slug}`}
                    onClick={closeStory}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
