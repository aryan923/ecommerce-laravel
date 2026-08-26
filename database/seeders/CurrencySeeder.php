<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Seed initial active currencies into the database.
     */
    public function run(): void
    {
        $currencies = [
            [
                'code' => 'INR',
                'name' => 'Indian Rupee',
                'symbol' => '₹',
                'exchange_rate' => 1.0,
                'is_default' => true,
                'status' => 'active',
                'decimal_places' => 2,
            ],
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 0.012,
                'is_default' => false,
                'status' => 'active',
                'decimal_places' => 2,
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.011,
                'is_default' => false,
                'status' => 'active',
                'decimal_places' => 2,
            ],
            [
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'exchange_rate' => 0.0095,
                'is_default' => false,
                'status' => 'active',
                'decimal_places' => 2,
            ],
        ];

        foreach ($currencies as $currData) {
            Currency::updateOrCreate(
                ['code' => $currData['code']],
                $currData
            );
        }
    }
}
