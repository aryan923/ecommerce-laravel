<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds for sample customers.
     */
    public function run(): void
    {
        $customers = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'mobile' => '+15550192834',
                'password' => Hash::make('CustomerSecret123!'),
                'status' => 'active',
                'role' => 'customer',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Jenkins',
                'name' => 'Sarah Jenkins',
                'email' => 'sarah.j@example.com',
                'mobile' => '+15550192835',
                'password' => Hash::make('CustomerSecret123!'),
                'status' => 'active',
                'role' => 'customer',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Brown',
                'name' => 'Michael Brown',
                'email' => 'michael.b@example.com',
                'mobile' => '+15550192836',
                'password' => Hash::make('CustomerSecret123!'),
                'status' => 'suspended',
                'role' => 'customer',
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Davis',
                'name' => 'Emily Davis',
                'email' => 'emily.davis@example.com',
                'mobile' => '+15550192837',
                'password' => Hash::make('CustomerSecret123!'),
                'status' => 'active',
                'role' => 'customer',
            ],
        ];

        foreach ($customers as $cData) {
            $user = User::firstOrCreate(['email' => $cData['email']], $cData);

            Address::firstOrCreate(
                ['user_id' => $user->id, 'line_1' => '123 E-Commerce Way'],
                [
                    'name' => $user->name,
                    'line_2' => 'Suite 400',
                    'city' => 'Austin',
                    'state' => 'TX',
                    'postal_code' => '78701',
                    'country' => 'United States',
                    'mobile' => $user->mobile,
                    'type' => 'home',
                    'is_default_shipping' => true,
                    'is_default_billing' => true,
                ]
            );
        }
    }
}
