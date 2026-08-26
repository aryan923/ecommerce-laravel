import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryBanners from '@/components/home/CategoryBanners';
import ProductSection from '@/components/home/ProductSection';
import PromoBanner from '@/components/home/PromoBanner';
import TrustBadges from '@/components/home/TrustBadges';
import BrandGrid from '@/components/home/BrandGrid';
import RecentlyViewed from '@/components/home/RecentlyViewed';

export const metadata = {
  title: "ECOMSTORE | Discover Things You'll Love",
  description: "Thoughtfully selected products, beautiful designs, and everyday essentials—all in one place.",
};

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen text-stone-900">
      {/* Hero Banner Section */}
      <HeroSlider />

      {/* Category Grid Section */}
      <CategoryBanners />

      {/* Curated Products Section */}
      <ProductSection title="Curated For You" subtitle="Handpicked favorites, just for you." />

      {/* Mid-Page Promo Banner */}
      <PromoBanner />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Partner Brand Logos */}
      <BrandGrid />

      {/* Recently Viewed Products */}
      <RecentlyViewed />
    </div>
  );
}
