<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Seed realistic luxury catalog products, categories, brands, and media assets.
     */
    public function run(): void
    {
        // 1. Create/Update Luxury Brands with friendly slugs
        $brands = [
            'Luxora Atelier' => ['slug' => 'luxora', 'desc' => 'Exquisite haute couture and handcrafted accessories.'],
            'Aura Paris' => ['slug' => 'aura-paris', 'desc' => 'Parisian luxury womenswear and evening couture.'],
            'Chronos & Co' => ['slug' => 'chronos', 'desc' => 'Swiss-engineered luxury chronometers and fine timepieces.'],
            'Vera Leather' => ['slug' => 'vera-leather', 'desc' => 'Artisanal Italian leather goods and handcrafted footwear.'],
            'Maison Gold' => ['slug' => 'maison-gold', 'desc' => 'Fine jewelry and diamond craftsmanship since 1920.'],
        ];

        $brandModels = [];
        foreach ($brands as $name => $info) {
            $brandModels[$name] = Brand::updateOrCreate(
                ['name' => $name],
                [
                    'slug' => $info['slug'],
                    'description' => $info['desc'],
                    'status' => 'active',
                    'sort_order' => 0,
                ]
            );
        }

        // 2. Create/Update Luxury Categories with friendly slugs
        $categoriesData = [
            'Women\'s Fashion' => ['slug' => 'women', 'subs' => ['Dresses', 'Eveningwear', 'Knitwear']],
            'Men\'s Collection' => ['slug' => 'men', 'subs' => ['Suits', 'Footwear', 'Casualwear']],
            'Watches & Timepieces' => ['slug' => 'watches', 'subs' => ['Chronographs', 'Automatic Watches']],
            'Handbags & Totes' => ['slug' => 'handbags', 'subs' => ['Leather Totes', 'Clutches']],
            'Fine Jewelry' => ['slug' => 'jewelry', 'subs' => ['Necklaces', 'Rings', 'Earrings']],
            'Accessories' => ['slug' => 'accessories', 'subs' => ['Sunglasses', 'Cardholders', 'Belts']],
        ];

        $categoryModels = [];
        foreach ($categoriesData as $parentName => $info) {
            $parentCat = Category::updateOrCreate(
                ['name' => $parentName],
                [
                    'slug' => $info['slug'],
                    'status' => 'active',
                    'sort_order' => 0,
                ]
            );
            $categoryModels[$parentName] = $parentCat;

            foreach ($info['subs'] as $subName) {
                $subCat = Category::updateOrCreate(
                    ['name' => $subName],
                    [
                        'parent_id' => $parentCat->id,
                        'slug' => Str::slug($subName),
                        'status' => 'active',
                        'sort_order' => 0,
                    ]
                );
                $categoryModels[$subName] = $subCat;
            }
        }

        // 3. Create Sample Luxury Products
        $products = [
            [
                'name' => 'Luxury Silk Evening Dress',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Aura Paris',
                'category' => 'Women\'s Fashion',
                'price' => 450.00,
                'sale_price' => 380.00,
                'cost_price' => 180.00,
                'image_url' => 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
                'short_description' => 'Handcrafted pure silk evening gown with delicate embroidery.',
                'description' => 'Elegantly tailored from 100% Mulberry silk with a cascading floor-length silhouette, invisible zip closure, and delicate hand-finished embroidery.',
            ],
            [
                'name' => 'Classic Chronometer Watch',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Chronos & Co',
                'category' => 'Watches & Timepieces',
                'price' => 890.00,
                'sale_price' => null,
                'cost_price' => 400.00,
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
                'short_description' => 'Swiss-made automatic chronometer with sapphire crystal glass.',
                'description' => 'Precision Swiss automatic movement housed in a polished stainless steel case with scratch-resistant sapphire crystal and genuine alligator leather strap.',
            ],
            [
                'name' => 'Artisanal Leather Tote',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Vera Leather',
                'category' => 'Handbags & Totes',
                'price' => 320.00,
                'sale_price' => 275.00,
                'cost_price' => 120.00,
                'image_url' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
                'short_description' => 'Full-grain Tuscan calfskin leather tote bag.',
                'description' => 'Handcrafted in Florence using vegetable-tanned full-grain leather. Features a spacious main compartment, suede lining, and interior zippered security pocket.',
            ],
            [
                'name' => 'Designer Sunglasses Gold',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Luxora Atelier',
                'category' => 'Accessories',
                'price' => 210.00,
                'sale_price' => null,
                'cost_price' => 85.00,
                'image_url' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
                'short_description' => '18k gold-plated aviator sunglasses with polarized UV400 lenses.',
                'description' => 'Hand-polished 18k gold-finished titanium frame with scratch-resistant polarized lenses providing 100% UVA/UVB protection.',
            ],
            [
                'name' => 'Italian Leather Loafers',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Vera Leather',
                'category' => 'Men\'s Collection',
                'price' => 540.00,
                'sale_price' => 490.00,
                'cost_price' => 210.00,
                'image_url' => 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop',
                'short_description' => 'Hand-burnished Italian calfskin horsebit loafers.',
                'description' => 'Traditional Blake-stitched construction with premium Italian leather upper, stacked heel, and padded leather footbed for effortless elegance.',
            ],
            [
                'name' => 'Cashmere Knit Sweater',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Luxora Atelier',
                'category' => 'Women\'s Fashion',
                'price' => 290.00,
                'sale_price' => null,
                'cost_price' => 110.00,
                'image_url' => 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
                'short_description' => '100% Grade-A Mongolian cashmere crewneck sweater.',
                'description' => 'Ultra-soft 2-ply Mongolian cashmere sweater with ribbed hem and cuffs. Exceptionally warm, lightweight, and breathable.',
            ],
            [
                'name' => 'Diamond Pendant Necklace',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Maison Gold',
                'category' => 'Fine Jewelry',
                'price' => 1400.00,
                'sale_price' => 1250.00,
                'cost_price' => 600.00,
                'image_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
                'short_description' => '18k yellow gold necklace with 0.75-carat solitaire diamond.',
                'description' => 'Certified conflict-free brilliant-cut solitaire diamond set in an 18k solid yellow gold 4-prong pendant with delicate 18-inch cable chain.',
            ],
            [
                'name' => 'Minimalist Leather Cardholder',
                'type' => 'simple',
                'status' => 'active',
                'featured' => false,
                'brand' => 'Luxora Atelier',
                'category' => 'Accessories',
                'price' => 110.00,
                'sale_price' => null,
                'cost_price' => 35.00,
                'image_url' => 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
                'short_description' => 'Slim 5-slot leather card case with RFID protection.',
                'description' => 'Crafted from smooth Nappa leather with RFID-blocking lining, 4 card slots, and central cash compartment.',
            ],
        ];

        foreach ($products as $pData) {
            $brandModel = !empty($pData['brand']) && isset($brandModels[$pData['brand']])
                ? $brandModels[$pData['brand']]
                : null;

            $catModel = !empty($pData['category']) && isset($categoryModels[$pData['category']])
                ? $categoryModels[$pData['category']]
                : null;

            $product = Product::updateOrCreate(
                ['slug' => Str::slug($pData['name'])],
                [
                    'name' => $pData['name'],
                    'sku' => Product::generateUniqueSku(),
                    'type' => $pData['type'],
                    'status' => $pData['status'],
                    'featured' => $pData['featured'],
                    'brand_id' => $brandModel?->id,
                    'price' => $pData['price'],
                    'sale_price' => $pData['sale_price'],
                    'cost_price' => $pData['cost_price'],
                    'short_description' => $pData['short_description'],
                    'description' => $pData['description'],
                    'requires_shipping' => true,
                ]
            );

            // Ensure brand_id is updated on existing product
            if ($brandModel) {
                $product->update(['brand_id' => $brandModel->id]);
            }

            if ($catModel) {
                $product->categories()->sync([
                    $catModel->id => ['is_primary' => true]
                ]);
            }

            // Create or Link Media & ProductImage
            if (!empty($pData['image_url'])) {
                $media = Media::firstOrCreate(
                    ['url' => $pData['image_url']],
                    [
                        'model_type' => Product::class,
                        'model_id' => $product->id,
                        'file_name' => Str::slug($product->name) . '.jpg',
                        'file_path' => 'products/' . Str::slug($product->name) . '.jpg',
                        'disk' => 'public',
                        'type' => 'main',
                        'mime_type' => 'image/jpeg',
                        'size' => 1024,
                        'alt' => $product->name,
                        'sort_order' => 0,
                    ]
                );

                ProductImage::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'media_id' => $media->id,
                    ],
                    [
                        'type' => 'main',
                        'sort_order' => 0,
                        'alt' => $product->name,
                    ]
                );
            }

            // Default variant for purchase flow
            if ($product->variants()->count() === 0) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'sale_price' => $product->sale_price,
                    'cost_price' => $product->cost_price,
                    'stock_qty' => 25,
                    'status' => 'active',
                ]);
            }
        }
    }
}
