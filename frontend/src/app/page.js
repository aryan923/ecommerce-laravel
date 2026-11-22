import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import VipPromoRibbon from '@/components/home/VipPromoRibbon';
import CategoryChipsRail from '@/components/home/CategoryChipsRail';
import CategoryBanners from '@/components/home/CategoryBanners';
import NewDropsCarousel from '@/components/home/NewDropsCarousel';
import ProductSection from '@/components/home/ProductSection';
import ShopTheLook from '@/components/home/ShopTheLook';
import PriceTierCurations from '@/components/home/PriceTierCurations';
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

      {/* 2. Slim VIP Privilege & Promo Ribbon (1-Click Copy Code) */}
      <VipPromoRibbon />

      {/* 3. Category Quick-Chips Rail (1-Click Department Navigation) */}
      <CategoryChipsRail />

      {/* 4. Visual Category Grid Section */}
      <CategoryBanners />

      {/* 5. Newest Drops of the Season (Horizontal Scrollable Carousel) */}
      <NewDropsCarousel />

      {/* 6. Curated Products Grid */}
      <ProductSection title="Curated For You" subtitle="Handpicked favorites, just for you." />

      {/* 7. Shop The Look / Editorial Lookbook */}
      <ShopTheLook />

      {/* 8. Curated by Price Tiers (Spending Thresholds / Gift Vault) */}
      <PriceTierCurations />

      {/* 9. Mid-Page Promo Banner */}
      <PromoBanner />

      {/* 10. Category Feature Showcase Banners */}
      <CategoryShowcaseBanners />

      {/* 11. Customer Testimonials & Verified Reviews */}
      <CustomerTestimonials />

      {/* 12. Value & Trust Badges */}
      <TrustBadges />

      {/* 13. Partner Brand Logos */}
      <BrandGrid />

      {/* 14. Frequently Asked Questions (FAQ) */}
      <HomeFaqSection />

      {/* 15. Recently Viewed Products */}
      <RecentlyViewed />

      {/* 16. Insider Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}
