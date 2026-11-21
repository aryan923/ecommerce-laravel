import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryBanners from '@/components/home/CategoryBanners';
import ProductSection from '@/components/home/ProductSection';
import CategoryShowcaseBanners from '@/components/home/CategoryShowcaseBanners';
import PromoBanner from '@/components/home/PromoBanner';
import TrustBadges from '@/components/home/TrustBadges';
import BrandGrid from '@/components/home/BrandGrid';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import NewsletterSection from '@/components/home/NewsletterSection';

export const metadata = {
  title: "ECOMSTORE | Discover Things You'll Love",
  description: "Thoughtfully selected products, beautiful designs, and everyday essentials—all in one place.",
};

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen text-stone-900">
      {/* 1. Hero Banner Section */}
      <HeroSlider />

      {/* 2. Category Grid Section */}
      <CategoryBanners />

      {/* 3. Curated Products Section */}
      <ProductSection title="Curated For You" subtitle="Handpicked favorites, just for you." />

      {/* 4. Mid-Page Promo Banner */}
      <PromoBanner />

      {/* 5. Category Feature Showcase Banners */}
      <CategoryShowcaseBanners />

      {/* 6. Partner Brand Logos */}
      <BrandGrid />

      {/* 7. Value & Trust Badges */}
      <TrustBadges />

      {/* 8. Recently Viewed Products */}
      <RecentlyViewed />

      {/* 9. Insider Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
