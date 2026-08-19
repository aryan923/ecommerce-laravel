<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Seed realistic sample review data into the database.
     */
    public function run(): void
    {
        $admin = AdminUser::first() ?? AdminUser::create([
            'name' => 'Store Moderator',
            'email' => 'admin@example.com',
            'password' => bcrypt('SecretAdmin123!'),
            'status' => 'active',
        ]);

        $users = User::all();
        if ($users->isEmpty()) {
            $users = collect([
                User::create(['name' => 'Sarah Connor', 'email' => 'sarah@example.com', 'password' => bcrypt('password')]),
                User::create(['name' => 'Alex Rivera', 'email' => 'alex@example.com', 'password' => bcrypt('password')]),
                User::create(['name' => 'Michael Chang', 'email' => 'michael@example.com', 'password' => bcrypt('password')]),
                User::create(['name' => 'Emily Watson', 'email' => 'emily@example.com', 'password' => bcrypt('password')]),
                User::create(['name' => 'David Miller', 'email' => 'david@example.com', 'password' => bcrypt('password')]),
            ]);
        }

        $products = Product::all();
        if ($products->isEmpty()) {
            $products = collect([
                Product::create([
                    'name' => 'Ultra Wireless Noise-Canceling Headphones',
                    'slug' => 'ultra-wireless-headphones',
                    'sku' => 'HD-ULTRA-01',
                    'price' => 249.99,
                    'status' => 'active',
                ]),
                Product::create([
                    'name' => 'Pro Mechanical Gaming Keyboard',
                    'slug' => 'pro-mechanical-keyboard',
                    'sku' => 'KB-PRO-02',
                    'price' => 129.99,
                    'status' => 'active',
                ]),
            ]);
        }

        // Create sample orders for users if none exist
        foreach ($users as $u) {
            if (!Order::where('user_id', $u->id)->exists()) {
                Order::create([
                    'user_id' => $u->id,
                    'order_number' => 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 8)),
                    'status' => 'delivered',
                    'grand_total' => 249.99,
                ]);
            }
        }

        $orders = Order::all();

        $sampleReviews = [
            [
                'rating' => 5,
                'title' => 'Absolute Perfection! Best Headphones I have owned.',
                'review' => 'The noise cancellation on these headphones is truly next-level. Battery life easily lasts 30+ hours on full charge. Highly recommended for daily travel and office work!',
                'status' => 'approved',
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&auto=format&fit=crop&q=60'
                ],
                'admin_reply' => 'Thank you so much Sarah! We are thrilled to hear you enjoy the noise cancellation and battery life!',
                'replied_at' => now()->subDays(2),
                'replied_by' => $admin->id,
                'is_flagged' => false,
            ],
            [
                'rating' => 5,
                'title' => 'Sleek design, crystal clear acoustics!',
                'review' => 'Build quality feels premium with soft memory foam ear cushions. Pairs seamlessly with both iOS and Android devices.',
                'status' => 'approved',
                'images' => [
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60'
                ],
                'admin_reply' => null,
                'is_flagged' => false,
            ],
            [
                'rating' => 4,
                'title' => 'Great value overall, slightly snug fit',
                'review' => 'Audio performance is top notch with deep bass response. Only giving 4 stars because the headband feels slightly tight during long 4-hour listening sessions.',
                'status' => 'approved',
                'images' => null,
                'admin_reply' => 'Thanks for the constructive feedback Alex! The memory foam headband will flex and adjust comfortably over the first week of use.',
                'replied_at' => now()->subDay(),
                'replied_by' => $admin->id,
                'is_flagged' => false,
            ],
            [
                'rating' => 5,
                'title' => 'Fast delivery and excellent customer support',
                'review' => 'Arrived in 2 business days in eco-friendly packaging. Everything works straight out of the box!',
                'status' => 'pending',
                'images' => null,
                'admin_reply' => null,
                'is_flagged' => false,
            ],
            [
                'rating' => 2,
                'title' => 'Bluetooth connection dropped twice during call',
                'review' => 'Sound is good when connected, but encountered intermittent Bluetooth disconnection when moving 10 meters away from laptop.',
                'status' => 'pending',
                'images' => null,
                'admin_reply' => null,
                'is_flagged' => false,
            ],
            [
                'rating' => 1,
                'title' => 'SPAM: BUY CHEAP REPLICAS AT WWW.FAKESITE.COM',
                'review' => 'Check out our store at http://fakesite.com for 90% discount code SPAM123!',
                'status' => 'rejected',
                'images' => null,
                'admin_reply' => null,
                'is_flagged' => true,
                'flag_reason' => 'Auto-flagged: External spam URL detected',
            ],
            [
                'rating' => 3,
                'title' => 'Average microphone quality outdoors',
                'review' => 'Good for music playback, but voice call quality in windy outdoor conditions could be improved.',
                'status' => 'hidden',
                'images' => null,
                'admin_reply' => null,
                'is_flagged' => false,
            ],
        ];

        foreach ($sampleReviews as $idx => $rev) {
            $user = $users->get($idx % $users->count());
            $product = $products->get($idx % $products->count());
            $order = Order::where('user_id', $user->id)->first() ?? $orders->first();

            Review::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ],
                [
                    'order_id' => $order->id,
                    'rating' => $rev['rating'],
                    'title' => $rev['title'],
                    'review' => $rev['review'],
                    'images' => $rev['images'],
                    'status' => $rev['status'],
                    'admin_reply' => $rev['admin_reply'] ?? null,
                    'replied_at' => $rev['replied_at'] ?? null,
                    'replied_by' => $rev['replied_by'] ?? null,
                    'is_flagged' => $rev['is_flagged'] ?? false,
                    'flag_reason' => $rev['flag_reason'] ?? null,
                    'created_at' => now()->subHours(($idx + 1) * 8),
                    'updated_at' => now()->subHours(($idx + 1) * 8),
                ]
            );
        }

        $this->command->info('Sample reviews seeded successfully!');
    }
}
