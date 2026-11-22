import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import EditorialCapsules from '@/components/home/EditorialCapsules';
import CategoryBanners from '@/components/home/CategoryBanners';
import ProductSection from '@/components/home/ProductSection';
import ShopTheLook from '@/components/home/ShopTheLook';
import PromoBanner from '@/components/home/PromoBanner';
import CategoryShowcaseBanners from '@/components/home/CategoryShowcaseBanners';
import CustomerTestimonials from '@/components/home/CustomerTestimonials';
import TrustBadges from '@/components/home/TrustBadges';
import BrandGrid from '@/components/home/BrandGrid';
import HomeFaqSection from '@/components/home/HomeFaqSection';
import RecentlyViewed from '@/components/home/RecentlyViewed';
import NewsletterSection from '@/components/home/NewsletterSection';

export const metadata = {
  title: "LUXORA | Discover Things You'll Love",
  description: "Thoughtfully selected products, beautiful designs, and everyday essentials—all in one place.",
};

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen text-stone-900">
      {/* 1. Hero Banner Section */}
      <HeroSlider />

      {/* 2. Editorial Capsule Edits */}
      <EditorialCapsules />

      {/* 3. Category Grid Section */}
      <CategoryBanners />

      {/* 4. Curated Products Grid */}
      <ProductSection title="Curated For You" subtitle="Handpicked favorites, just for you." />

      {/* 5. Shop The Look / Editorial Lookbook */}
      <ShopTheLook />

      {/* 6. Mid-Page Promo Banner */}
      <PromoBanner />

      {/* 7. Category Feature Showcase Banners */}
      <CategoryShowcaseBanners />

      {/* 8. Customer Testimonials & Verified Reviews */}
      <CustomerTestimonials />

      {/* 9. Value & Trust Badges */}
      <TrustBadges />

      {/* 10. Partner Brand Logos */}
      <BrandGrid />

      {/* 11. Frequently Asked Questions (FAQ) */}
      <HomeFaqSection />

      {/* 12. Recently Viewed Products */}
      <RecentlyViewed />

      {/* 13. Insider Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
