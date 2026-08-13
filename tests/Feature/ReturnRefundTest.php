<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ReturnItem;
use App\Models\ReturnRequest;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReturnRefundTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected AdminUser $admin;
    protected string $adminToken;
    protected Product $product;
    protected ProductVariant $variant;
    protected Order $deliveredOrder;
    protected OrderItem $orderItem;
    protected Payment $payment;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->customer = User::factory()->create(['email' => 'customer_returns@example.com']);
        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $brand = Brand::create(['name' => 'Brand RET', 'slug' => 'brand-ret']);
        $category = Category::create(['name' => 'Cat RET', 'slug' => 'cat-ret']);

        $this->product = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Returnable Item',
            'slug' => 'returnable-item',
            'sku' => 'RET-PRO-01',
            'price' => 1000.00,
            'status' => 'active',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'RET-PRO-01-VAR',
            'price' => 1000.00,
            'stock_qty' => 10,
        ]);

        Inventory::updateOrCreate(
            ['product_variant_id' => $this->variant->id],
            [
                'sku' => $this->variant->sku,
                'available_qty' => 10,
                'reserved_qty' => 0,
                'committed_qty' => 2,
                'damaged_qty' => 0,
                'returned_qty' => 0,
                'low_stock_threshold' => 5,
            ]
        );

        $this->deliveredOrder = Order::create([
            'order_number' => 'ORD-20260813-7001',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'currency' => 'INR',
            'subtotal' => 2000.00,
            'grand_total' => 2000.00,
            'payment_method' => 'razorpay',
        ]);

        $this->orderItem = OrderItem::create([
            'order_id' => $this->deliveredOrder->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => 'Returnable Item',
            'sku' => 'RET-PRO-01-VAR',
            'unit_price' => 1000.00,
            'quantity' => 2,
            'total_amount' => 2000.00,
        ]);

        $this->payment = Payment::create([
            'order_id' => $this->deliveredOrder->id,
            'gateway' => 'razorpay',
            'payment_method' => 'razorpay',
            'transaction_id' => 'pay_delivered_991',
            'amount' => 2000.00,
            'currency' => 'INR',
            'status' => 'captured',
        ]);
    }

    /**
     * Test customer can submit a return request for a delivered order.
     */
    public function test_customer_can_submit_return_request_for_delivered_order(): void
    {
        $payload = [
            'order_id' => $this->deliveredOrder->id,
            'reason' => 'defective',
            'description' => 'Item defective upon arrival',
            'items' => [
                [
                    'order_item_id' => $this->orderItem->id,
                    'quantity' => 1,
                ],
            ],
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/returns', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.reason', 'defective');

        $this->assertDatabaseHas('returns', [
            'order_id' => $this->deliveredOrder->id,
            'user_id' => $this->customer->id,
            'status' => 'requested',
        ]);

        $this->assertDatabaseHas('return_items', [
            'order_item_id' => $this->orderItem->id,
            'quantity' => 1,
        ]);
    }

    /**
     * Test return request fails for non-delivered order.
     */
    public function test_return_request_fails_for_nondelivered_order(): void
    {
        $pendingOrder = Order::create([
            'order_number' => 'ORD-20260813-7002',
            'user_id' => $this->customer->id,
            'status' => 'confirmed',
            'grand_total' => 1000.00,
        ]);

        $item = OrderItem::create([
            'order_id' => $pendingOrder->id,
            'product_id' => $this->product->id,
            'product_name' => 'Returnable Item',
            'sku' => 'RET-PRO-01-VAR',
            'quantity' => 1,
            'unit_price' => 1000.00,
            'total_amount' => 1000.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/returns', [
                'order_id' => $pendingOrder->id,
                'reason' => 'defective',
                'items' => [
                    ['order_item_id' => $item->id, 'quantity' => 1],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test return request fails when quantity exceeds purchased amount.
     */
    public function test_return_request_fails_exceeding_item_purchased_quantity(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->postJson('/api/v1/customer/returns', [
                'order_id' => $this->deliveredOrder->id,
                'reason' => 'defective',
                'items' => [
                    ['order_item_id' => $this->orderItem->id, 'quantity' => 10],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test customer can list and view return details.
     */
    public function test_customer_can_list_and_view_their_returns(): void
    {
        $return = ReturnRequest::create([
            'return_number' => 'RET-20260813-1001',
            'order_id' => $this->deliveredOrder->id,
            'user_id' => $this->customer->id,
            'status' => 'requested',
            'reason' => 'wrong_item',
        ]);

        $listResp = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/v1/customer/returns');

        $listResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.return_number', 'RET-20260813-1001');

        $detailResp = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/v1/customer/returns/RET-20260813-1001');

        $detailResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.reason', 'wrong_item');
    }

    /**
     * Test Admin can list returns and update return status milestones.
     */
    public function test_admin_can_list_and_update_return_status(): void
    {
        $return = ReturnRequest::create([
            'return_number' => 'RET-20260813-2002',
            'order_id' => $this->deliveredOrder->id,
            'user_id' => $this->customer->id,
            'status' => 'requested',
            'reason' => 'defective',
        ]);

        // List as Admin
        $listResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->getJson('/api/v1/admin/returns');

        $listResp->assertStatus(200)->assertJsonPath('success', true);

        // Update status to approved
        $statusResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/returns/{$return->id}/status", [
                'status' => 'approved',
                'notes' => 'Approved for pickup',
            ]);

        $statusResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('returns', [
            'id' => $return->id,
            'status' => 'approved',
        ]);
    }

    /**
     * Test Admin can restock returned items into inventory.
     */
    public function test_admin_can_restock_returned_item_into_inventory(): void
    {
        $return = ReturnRequest::create([
            'return_number' => 'RET-20260813-3003',
            'order_id' => $this->deliveredOrder->id,
            'user_id' => $this->customer->id,
            'status' => 'quality_check',
            'reason' => 'defective',
        ]);

        ReturnItem::create([
            'return_id' => $return->id,
            'order_item_id' => $this->orderItem->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 2,
            'unit_price' => 1000.00,
            'refund_amount' => 2000.00,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson("/api/v1/admin/returns/{$return->id}/restock");

        $response->assertStatus(200)->assertJsonPath('success', true);

        // Inventory available_qty increased by 2 (10 -> 12)
        $this->assertDatabaseHas('inventories', [
            'product_variant_id' => $this->variant->id,
            'available_qty' => 12,
        ]);
    }

    /**
     * Test Admin can process full and partial refunds.
     */
    public function test_admin_can_process_full_and_partial_refunds(): void
    {
        // 1. Partial Refund (500.00 out of 2000.00)
        $partialResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/refunds/process', [
                'order_id' => $this->deliveredOrder->id,
                'amount' => 500.00,
                'reason' => 'Partial return refund',
                'gateway' => 'razorpay',
            ]);

        $partialResp->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.amount', '500.00');

        $this->assertDatabaseHas('payments', [
            'id' => $this->payment->id,
            'status' => 'partially_refunded',
        ]);

        // 2. Remaining Full Refund (1500.00)
        $fullResp = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/refunds/process', [
                'order_id' => $this->deliveredOrder->id,
                'amount' => 1500.00,
                'reason' => 'Remaining full refund',
                'gateway' => 'razorpay',
            ]);

        $fullResp->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'id' => $this->payment->id,
            'status' => 'refunded',
        ]);
    }
}
