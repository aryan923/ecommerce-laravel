<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Page;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    /**
     * Seed initial CMS Pages and Banners.
     */
    public function run(): void
    {
        // Seed default Hero Banners
        if (Banner::count() === 0) {
            Banner::create([
                'title' => 'Spring Elegance Collection 2026',
                'image_desktop' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80',
                'image_mobile' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
                'link_url' => '/products',
                'button_text' => 'Shop Collection',
                'placement' => 'home_hero',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            Banner::create([
                'title' => 'Exclusive Autumn Savings',
                'image_desktop' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
                'image_mobile' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
                'link_url' => '/products?featured=1',
                'button_text' => 'Explore Sale',
                'placement' => 'home_hero',
                'sort_order' => 2,
                'is_active' => true,
            ]);
        }

        // Seed default CMS Pages
        $pages = [
            [
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'seo_title' => 'Privacy Policy | Luxora Premium Storefront',
                'seo_description' => 'Learn how Luxora collects, uses, and safeguards your personal information.',
                'content' => '<h2>1. Information We Collect</h2><p>At Luxora, we respect your personal privacy and process your data with the highest standard of security. We collect account details, order history, and browsing metrics to optimize your shopping experience.</p><h2>2. Use of Information</h2><p>Your information is used strictly to process orders, manage deliveries, prevent fraud, and provide customer support.</p><h2>3. Third-Party Sharing</h2><p>We do not sell or rent customer data. Trusted third-party payment gateways and shipping partners receive necessary operational data under strict confidentiality agreements.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => 'terms-and-conditions',
                'seo_title' => 'Terms & Conditions | Luxora',
                'seo_description' => 'Official terms of service governing purchases, accounts, and website usage at Luxora.',
                'content' => '<h2>1. General Terms</h2><p>Welcome to Luxora. By accessing or purchasing from our platform, you agree to comply with our standard terms of service.</p><h2>2. Product Pricing & Availability</h2><p>All prices are listed in local currencies and include relevant taxes where specified. Prices and product availability remain subject to change without prior notification.</p><h2>3. Intellectual Property</h2><p>All store branding, image catalogs, and interface content are exclusive property of Luxora.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'About Us',
                'slug' => 'about-us',
                'seo_title' => 'About Us | The Luxora Legacy',
                'seo_description' => 'Discover Luxora\'s mission to redefine online shopping with curated quality and timeless design.',
                'content' => '<h2>Our Legacy</h2><p>Founded with a passion for excellence, Luxora bridges high-end craftsmanship with modern online convenience.</p><h2>Our Commitment</h2><p>We curate only premium products, ensuring sustainable sourcing, uncompromised quality, and exceptional customer delight.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Shipping Policy',
                'slug' => 'shipping-policy',
                'seo_title' => 'Shipping & Delivery Policy | Luxora',
                'seo_description' => 'Details regarding domestic and international shipping times, tracking, and fees.',
                'content' => '<h2>1. Standard Delivery</h2><p>Standard shipping takes 3-5 business days across all domestic locations. Express overnight delivery is available at checkout.</p><h2>2. Order Tracking</h2><p>Once dispatched, you will receive an SMS and email notification containing your live tracking number.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Return Policy',
                'slug' => 'return-policy',
                'seo_title' => 'Return & Refund Policy | Luxora',
                'seo_description' => 'Read our 30-day return policy and instructions for hassle-free product exchanges.',
                'content' => '<h2>1. 30-Day Hassle-Free Returns</h2><p>We want you to love your purchase. Items in original condition with original tags can be returned within 30 days of delivery.</p><h2>2. Refund Processing</h2><p>Once your returned item is inspected at our warehouse, your refund will be issued to your original payment method within 5-7 business days.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Frequently Asked Questions (FAQs)',
                'slug' => 'faqs',
                'seo_title' => 'Frequently Asked Questions | Luxora Support',
                'seo_description' => 'Find quick answers to common questions about orders, shipping, returns, and account settings.',
                'content' => '<h2>How do I track my order?</h2><p>You can track your order using the Live Order Tracking link in the header or by logging into your account dashboard.</p><h2>What payment methods are accepted?</h2><p>We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay.</p>',
                'status' => 'published',
            ],
        ];

        foreach ($pages as $p) {
            Page::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
