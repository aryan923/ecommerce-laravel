<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Seed realistic sample catalog products, categories, and brands.
     */
    public function run(): void
    {
        // 1. Create Brands
        $brands = [
            'Apple' => 'Premium Consumer Electronics & Computers',
            'Nike' => 'Athletic Footwear & Performance Apparel',
            'Samsung' => 'Smartphones, Displays & Home Electronics',
            'Adidas' => 'Sportswear & Casual Streetwear',
            'Sony' => 'Audio Equipment & Gaming Consoles',
        ];

        $brandModels = [];
        foreach ($brands as $name => $desc) {
            $brandModels[$name] = Brand::firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $desc,
                    'status' => 'active',
                    'sort_order' => 0,
                ]
            );
        }

        // 2. Create Categories
        $categoriesData = [
            'Electronics' => ['Smartphones', 'Headphones & Audio', 'Wearables'],
            'Apparel & Fashion' => ['Men\'s Clothing', 'Women\'s Clothing', 'Footwear'],
            'Digital Goods' => ['E-Books', 'Software Templates'],
        ];

        $categoryModels = [];
        foreach ($categoriesData as $parentName => $subs) {
            $parentCat = Category::firstOrCreate(
                ['slug' => Str::slug($parentName)],
                [
                    'name' => $parentName,
                    'status' => 'active',
                    'sort_order' => 0,
                ]
            );
            $categoryModels[$parentName] = $parentCat;

            foreach ($subs as $subName) {
                $subCat = Category::firstOrCreate(
                    ['slug' => Str::slug($subName)],
                    [
                        'parent_id' => $parentCat->id,
                        'name' => $subName,
                        'status' => 'active',
                        'sort_order' => 0,
                    ]
                );
                $categoryModels[$subName] = $subCat;
            }
        }

        // 3. Create Sample Products
        $products = [
            [
                'name' => 'Wireless Noise-Canceling Headphones',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Sony',
                'category' => 'Headphones & Audio',
                'price' => 299.99,
                'sale_price' => 249.99,
                'cost_price' => 150.00,
                'short_description' => 'Industry-leading noise canceling with Dual Noise Sensor technology.',
                'description' => 'Immerse yourself in music with premium noise-canceling headphones featuring up to 30-hour battery life, touch sensor controls, and crystal-clear hands-free calling.',
            ],
            [
                'name' => 'Smartwatch Series X Pro',
                'type' => 'simple',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Apple',
                'category' => 'Wearables',
                'price' => 399.00,
                'sale_price' => 379.00,
                'cost_price' => 220.00,
                'short_description' => 'Advanced health sensors, Always-On Retina display, and fast charging.',
                'description' => 'Track your fitness metrics, measure blood oxygen, monitor sleep stages, and stay connected on the go with cellular capability.',
            ],
            [
                'name' => 'Air Zoom Running Shoes',
                'type' => 'variable',
                'status' => 'active',
                'featured' => true,
                'brand' => 'Nike',
                'category' => 'Footwear',
                'price' => 129.99,
                'sale_price' => null,
                'cost_price' => 60.00,
                'short_description' => 'Responsive cushioning and breathable mesh for long-distance runners.',
                'description' => 'Designed for road running with lightweight Zoom Air units that provide explosive energy return on every stride.',
            ],
            [
                'name' => 'Cotton Essential Crewneck T-Shirt',
                'type' => 'simple',
                'status' => 'active',
                'featured' => false,
                'brand' => 'Adidas',
                'category' => 'Men\'s Clothing',
                'price' => 35.00,
                'sale_price' => 28.00,
                'cost_price' => 12.00,
                'short_description' => '100% organic cotton everyday casual t-shirt.',
                'description' => 'Soft, breathable organic cotton jersey with ribbed crewneck collar and subtle brand chest logo.',
            ],
            [
                'name' => 'E-Commerce Laravel Architecture Guide',
                'type' => 'digital',
                'status' => 'active',
                'featured' => false,
                'brand' => null,
                'category' => 'E-Books',
                'price' => 49.99,
                'sale_price' => 29.99,
                'cost_price' => 0.00,
                'short_description' => 'Comprehensive PDF handbook on building scalable enterprise Laravel apps.',
                'description' => 'Learn RBAC, REST APIs, payment gateways, micro-services, inventory control, and multi-currency design pattern implementations in modern Laravel.',
                'download_url' => 'https://example.com/downloads/laravel-guide.pdf',
                'download_limit' => 5,
                'download_expiry_days' => 30,
            ],
            [
                'name' => 'Ultra HD 4K Smart TV 55 Inch',
                'type' => 'simple',
                'status' => 'active',
                'featured' => false,
                'brand' => 'Samsung',
                'category' => 'Electronics',
                'price' => 699.99,
                'sale_price' => 599.99,
                'cost_price' => 400.00,
                'short_description' => 'Vibrant QLED display with Quantum HDR and built-in voice assistants.',
                'description' => 'Transform your living space into a cinematic theater with 4K resolution, Motion Xcelerator technology, and Object Tracking Sound.',
            ],
        ];

        foreach ($products as $pData) {
            $brandId = !empty($pData['brand']) && isset($brandModels[$pData['brand']])
                ? $brandModels[$pData['brand']]->id
                : null;

            $catModel = !empty($pData['category']) && isset($categoryModels[$pData['category']])
                ? $categoryModels[$pData['category']]
                : null;

            $product = Product::firstOrCreate(
                ['slug' => Str::slug($pData['name'])],
                [
                    'name' => $pData['name'],
                    'sku' => Product::generateUniqueSku(),
                    'type' => $pData['type'],
                    'status' => $pData['status'],
                    'featured' => $pData['featured'],
                    'brand_id' => $brandId,
                    'price' => $pData['price'],
                    'sale_price' => $pData['sale_price'],
                    'cost_price' => $pData['cost_price'],
                    'short_description' => $pData['short_description'],
                    'description' => $pData['description'],
                    'requires_shipping' => $pData['type'] !== 'digital',
                    'download_url' => $pData['download_url'] ?? null,
                    'download_limit' => $pData['download_limit'] ?? null,
                    'download_expiry_days' => $pData['download_expiry_days'] ?? null,
                ]
            );

            if ($catModel) {
                $product->categories()->sync([
                    $catModel->id => ['is_primary' => true]
                ]);
            }

            // If variable product, create sample variants
            if ($pData['type'] === 'variable' && $product->variants()->count() === 0) {
                $variants = [
                    ['sku_suffix' => 'BLK-8', 'price' => 129.99, 'stock_qty' => 25],
                    ['sku_suffix' => 'BLK-9', 'price' => 129.99, 'stock_qty' => 18],
                    ['sku_suffix' => 'BLK-10', 'price' => 129.99, 'stock_qty' => 12],
                    ['sku_suffix' => 'BLU-9', 'price' => 119.99, 'stock_qty' => 8],
                ];

                foreach ($variants as $v) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => "{$product->sku}-{$v['sku_suffix']}",
                        'price' => $v['price'],
                        'stock_qty' => $v['stock_qty'],
                        'status' => 'active',
                    ]);
                }
            }
        }
    }
}
