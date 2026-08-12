<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customer = User::create([
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'name' => 'Alice Smith',
            'email' => 'alice@example.com',
            'mobile' => '+1122334455',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
        ]);

        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;
    }

    /**
     * Test fetching authenticated customer profile.
     */
    public function test_customer_can_fetch_profile(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/v1/customer/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'alice@example.com',
                    'first_name' => 'Alice',
                    'last_name' => 'Smith',
                ],
            ]);
    }

    /**
     * Test updating customer profile details.
     */
    public function test_customer_can_update_profile(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->putJson('/api/v1/customer/profile', [
                'first_name' => 'Alice',
                'last_name' => 'Johnson',
                'gender' => 'female',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'last_name' => 'Johnson',
                    'name' => 'Alice Johnson',
                    'gender' => 'female',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->customer->id,
            'last_name' => 'Johnson',
        ]);
    }

    /**
     * Test changing customer password success.
     */
    public function test_customer_can_change_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/change-password', [
                'current_password' => 'Secret123!',
                'password' => 'NewSecret456!',
                'password_confirmation' => 'NewSecret456!',
            ]);

        $response->assertStatus(200);

        $this->assertTrue(Hash::check('NewSecret456!', $this->customer->fresh()->password));
    }

    /**
     * Test change password failure on incorrect current password.
     */
    public function test_change_password_fails_on_wrong_current_password(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/change-password', [
                'current_password' => 'WrongPassword',
                'password' => 'NewSecret456!',
                'password_confirmation' => 'NewSecret456!',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    /**
     * Test creating first address auto-assigns default shipping and billing flags.
     */
    public function test_creating_first_address_auto_sets_defaults(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/addresses', [
                'name' => 'Home',
                'mobile' => '+1122334455',
                'line_1' => '123 Ocean Drive',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
                'postal_code' => '400001',
                'type' => 'home',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'is_default_shipping' => true,
                    'is_default_billing' => true,
                ],
            ]);
    }

    /**
     * Test single default shipping address demotion logic.
     */
    public function test_creating_second_default_shipping_address_demotes_first(): void
    {
        $addr1 = Address::create([
            'user_id' => $this->customer->id,
            'name' => 'Addr 1',
            'mobile' => '+1122334455',
            'line_1' => 'Street 1',
            'city' => 'City 1',
            'state' => 'State 1',
            'postal_code' => '100001',
            'is_default_shipping' => true,
            'is_default_billing' => true,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/addresses', [
                'name' => 'Addr 2',
                'mobile' => '+1122334455',
                'line_1' => 'Street 2',
                'city' => 'City 2',
                'state' => 'State 2',
                'postal_code' => '100002',
                'is_default_shipping' => true,
            ]);

        $response->assertStatus(201);

        $this->assertFalse((bool) $addr1->fresh()->is_default_shipping);
        $this->assertTrue((bool) Address::find($response->json('data.id'))->is_default_shipping);
    }

    /**
     * Test customer cannot access another customer's address.
     */
    public function test_customer_cannot_access_other_customer_address(): void
    {
        $otherCustomer = User::create([
            'first_name' => 'Bob',
            'last_name' => 'Jones',
            'name' => 'Bob Jones',
            'email' => 'bob@example.com',
            'password' => Hash::make('Secret123!'),
        ]);

        $otherAddress = Address::create([
            'user_id' => $otherCustomer->id,
            'name' => 'Bob Home',
            'mobile' => '+9988776655',
            'line_1' => 'Bob Street',
            'city' => 'Delhi',
            'state' => 'Delhi',
            'postal_code' => '110001',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson("/api/v1/customer/addresses/{$otherAddress->id}");

        $response->assertStatus(404);
    }

    /**
     * Test updating and deleting saved address.
     */
    public function test_customer_can_update_and_delete_address(): void
    {
        $address = Address::create([
            'user_id' => $this->customer->id,
            'name' => 'Office',
            'mobile' => '+1122334455',
            'line_1' => 'Tech Park',
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'postal_code' => '411001',
        ]);

        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->putJson("/api/v1/customer/addresses/{$address->id}", [
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'city' => 'Bengaluru',
                    'state' => 'Karnataka',
                ],
            ]);

        $deleteResponse = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->deleteJson("/api/v1/customer/addresses/{$address->id}");

        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
    }
}
