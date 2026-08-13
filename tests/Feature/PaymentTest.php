<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentWebhook;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected AdminUser $admin;
    protected string $adminToken;
    protected Order $pendingOrder;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->customer = User::factory()->create([
            'email' => 'customer_payment@example.com',
        ]);
        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $this->pendingOrder = Order::create([
            'order_number' => 'ORD-20260813-9001',
            'user_id' => $this->customer->id,
            'status' => 'pending_payment',
            'currency' => 'INR',
            'subtotal' => 1500.00,
            'grand_total' => 1500.00,
            'payment_method' => 'razorpay',
        ]);
    }

    /**
     * Test fetching available payment methods.
     */
    public function test_can_list_available_payment_methods(): void
    {
        $response = $this->getJson('/api/v1/payments/methods?amount=1500.00&postal_code=400001');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'type', 'available'],
                ],
            ]);
    }

    /**
     * Test initiating Razorpay payment.
     */
    public function test_can_initiate_razorpay_payment(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/initiate', [
                'order_id' => $this->pendingOrder->id,
                'payment_method' => 'razorpay',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.gateway', 'razorpay')
            ->assertJsonPath('data.order_number', 'ORD-20260813-9001');

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->pendingOrder->id,
            'gateway' => 'razorpay',
            'status' => 'initiated',
        ]);
    }

    /**
     * Test verifying Razorpay payment callback with valid signature.
     */
    public function test_can_verify_razorpay_payment_with_valid_signature(): void
    {
        // Initiate first
        $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/initiate', [
                'order_id' => $this->pendingOrder->id,
                'payment_method' => 'razorpay',
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/verify', [
                'order_id' => $this->pendingOrder->id,
                'payment_method' => 'razorpay',
                'razorpay_payment_id' => 'pay_test_9981',
                'razorpay_order_id' => 'order_rzp_test_123',
                'razorpay_signature' => 'valid_test_signature',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'captured');

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->pendingOrder->id,
            'status' => 'captured',
            'transaction_id' => 'pay_test_9981',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->pendingOrder->id,
            'status' => 'paid',
        ]);
    }

    /**
     * Test payment verification fails with invalid signature.
     */
    public function test_verification_fails_with_invalid_signature(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/verify', [
                'order_id' => $this->pendingOrder->id,
                'payment_method' => 'razorpay',
                'razorpay_payment_id' => 'pay_test_9981',
                'razorpay_order_id' => 'order_rzp_test_123',
                'razorpay_signature' => 'invalid_signature',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->pendingOrder->id,
            'status' => 'failed',
        ]);
    }

    /**
     * Test initiating COD payment under maximum limit.
     */
    public function test_can_initiate_cod_payment_under_limit(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/initiate', [
                'order_id' => $this->pendingOrder->id,
                'payment_method' => 'cod',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.gateway', 'cod');

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->pendingOrder->id,
            'gateway' => 'cod',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->pendingOrder->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test COD initiation fails when exceeding max order limit.
     */
    public function test_cod_initiation_fails_when_exceeding_max_limit(): void
    {
        $largeOrder = Order::create([
            'order_number' => 'ORD-20260813-9999',
            'user_id' => $this->customer->id,
            'status' => 'pending_payment',
            'currency' => 'INR',
            'subtotal' => 50000.00,
            'grand_total' => 50000.00,
            'payment_method' => 'cod',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/initiate', [
                'order_id' => $largeOrder->id,
                'payment_method' => 'cod',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test processing webhook event idempotently.
     */
    public function test_processes_webhook_event_idempotently(): void
    {
        // Setup payment
        $payment = Payment::create([
            'order_id' => $this->pendingOrder->id,
            'gateway' => 'razorpay',
            'payment_method' => 'razorpay',
            'gateway_order_id' => 'order_rzp_wh_100',
            'amount' => 1500.00,
            'currency' => 'INR',
            'status' => 'initiated',
        ]);

        $webhookPayload = [
            'event_id' => 'evt_wh_test_001',
            'event' => 'payment.captured',
            'payload' => [
                'payment' => [
                    'entity' => [
                        'id' => 'pay_wh_999',
                        'order_id' => 'order_rzp_wh_100',
                        'status' => 'captured',
                    ],
                ],
            ],
        ];

        // First call
        $response1 = $this->postJson('/api/v1/webhooks/payment/razorpay', $webhookPayload);
        $response1->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseHas('payment_webhooks', [
            'provider' => 'razorpay',
            'event_id' => 'evt_wh_test_001',
            'processing_status' => 'processed',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->pendingOrder->id,
            'status' => 'paid',
        ]);

        // Second call (Idempotent duplicate)
        $response2 = $this->postJson('/api/v1/webhooks/payment/razorpay', $webhookPayload);
        $response2->assertStatus(200)->assertJsonPath('success', true);

        // Verify only 1 webhook record exists
        $this->assertEquals(1, PaymentWebhook::where('event_id', 'evt_wh_test_001')->count());
    }

    /**
     * Test cannot re-initiate payment for an already paid order.
     */
    public function test_cannot_reinitiate_payment_for_already_paid_order(): void
    {
        $this->pendingOrder->status = 'paid';
        $this->pendingOrder->save();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/payments/initiate', [
                'order_id' => $this->pendingOrder->id,
                'payment_method' => 'razorpay',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test Admin can list payments and manually mark payment as paid.
     */
    public function test_admin_can_list_payments_and_mark_as_paid(): void
    {
        $payment = Payment::create([
            'order_id' => $this->pendingOrder->id,
            'gateway' => 'cod',
            'payment_method' => 'cod',
            'amount' => 1500.00,
            'currency' => 'INR',
            'status' => 'pending',
        ]);

        // List payments as Admin
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/payments');

        $listResponse->assertStatus(200)->assertJsonPath('success', true);

        // Mark as paid
        $markResponse = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/payments/{$payment->id}/mark-paid", [
                'transaction_id' => 'COD-CASH-MANUAL-001',
                'notes' => 'Cash collected on delivery',
            ]);

        $markResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'captured');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'captured',
            'transaction_id' => 'COD-CASH-MANUAL-001',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->pendingOrder->id,
            'status' => 'paid',
        ]);
    }
}
