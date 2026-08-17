<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\CustomerBankAccount;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Refund;
use App\Models\ReturnItem;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReturnRefundManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected User $customer;
    protected Order $order;
    protected OrderItem $orderItem;
    protected ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'RbacSeeder']);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();

        $this->customer = User::create([
            'name' => 'Alice Customer',
            'email' => 'alice.returns@example.com',
            'mobile' => '+919988776655',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);

        $product = Product::create([
            'name' => 'Wireless Headphones',
            'slug' => 'wireless-headphones',
            'sku' => 'HDPHN-001',
            'type' => 'simple',
            'status' => 'active',
            'price' => 2000.00,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'HDPHN-001-BLK',
            'price' => 2000.00,
        ]);

        $this->variant->inventory()->update([
            'available_qty' => 10,
            'reserved_qty' => 0,
        ]);

        $this->order = Order::create([
            'order_number' => 'ORD-RET-TEST-01',
            'user_id' => $this->customer->id,
            'status' => 'delivered',
            'currency' => 'INR',
            'subtotal' => 2000.00,
            'grand_total' => 2000.00,
            'payment_method' => 'cod',
        ]);

        $this->orderItem = OrderItem::create([
            'order_id' => $this->order->id,
            'product_id' => $product->id,
            'product_variant_id' => $this->variant->id,
            'product_name' => 'Wireless Headphones - Black',
            'sku' => 'HDPHN-001-BLK',
            'unit_price' => 2000.00,
            'quantity' => 1,
            'total_amount' => 2000.00,
            'snapshot_data' => [
                'name' => 'Wireless Headphones - Black',
                'sku' => 'HDPHN-001-BLK',
            ],
        ]);

        Payment::create([
            'order_id' => $this->order->id,
            'payment_method' => 'cod',
            'gateway' => 'manual',
            'status' => 'captured',
            'amount' => 2000.00,
            'currency' => 'INR',
        ]);
    }

    public function test_customer_can_manage_saved_bank_accounts(): void
    {
        // 1. Customer creates a bank account
        $createRes = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/customer/bank-accounts', [
                'account_holder_name' => 'Alice Customer',
                'bank_name' => 'HDFC Bank',
                'account_number' => '50100987654321',
                'ifsc_code' => 'HDFC0001234',
                'account_type' => 'savings',
                'upi_id' => 'alice@hdfcbank',
            ]);

        $createRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'account_holder_name' => 'Alice Customer',
                    'bank_name' => 'HDFC Bank',
                    'is_default' => true,
                ],
            ]);

        $bankId = $createRes->json('data.id');

        // 2. Customer lists bank accounts
        $listRes = $this->actingAs($this->customer, 'sanctum')
            ->getJson('/api/v1/customer/bank-accounts');

        $listRes->assertStatus(200)
            ->assertJsonPath('data.0.id', $bankId);

        // 3. Customer deletes bank account
        $delRes = $this->actingAs($this->customer, 'sanctum')
            ->deleteJson("/api/v1/customer/bank-accounts/{$bankId}");

        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('customer_bank_accounts', ['id' => $bankId]);
    }

    public function test_admin_can_view_returns_and_refunds_stats(): void
    {
        $return = ReturnRequest::create([
            'return_number' => 'RET-STAT-01',
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'status' => 'requested',
            'reason' => 'Defective earpiece',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/returns/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_returns' => 1,
                    'requested_returns' => 1,
                ],
            ]);
    }

    public function test_admin_can_list_returns_and_view_360_detail(): void
    {
        $bankAccount = CustomerBankAccount::create([
            'user_id' => $this->customer->id,
            'account_holder_name' => 'Alice Customer',
            'bank_name' => 'ICICI Bank',
            'account_number' => '000105001234',
            'ifsc_code' => 'ICIC0000001',
            'is_default' => true,
        ]);

        $return = ReturnRequest::create([
            'return_number' => 'RET-LIST-01',
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'bank_account_id' => $bankAccount->id,
            'bank_details_snapshot' => $bankAccount->toSnapshot(),
            'status' => 'under_review',
            'reason' => 'Wrong color received',
        ]);

        ReturnItem::create([
            'return_id' => $return->id,
            'order_item_id' => $this->orderItem->id,
            'product_id' => $this->orderItem->product_id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 1,
            'unit_price' => 2000.00,
            'refund_amount' => 2000.00,
        ]);

        // List test
        $listRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/returns?search=RET-LIST-01');

        $listRes->assertStatus(200)
            ->assertJsonPath('data.data.0.return_number', 'RET-LIST-01');

        // Show 360 detail test
        $detailRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/returns/{$return->id}");

        $detailRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'return_number' => 'RET-LIST-01',
                    'status' => 'under_review',
                    'bank_details_snapshot' => [
                        'bank_name' => 'ICICI Bank',
                        'ifsc_code' => 'ICIC0000001',
                    ],
                ],
            ]);
    }

    public function test_admin_can_update_return_milestones_and_restock(): void
    {
        $return = ReturnRequest::create([
            'return_number' => 'RET-STATUS-01',
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'status' => 'requested',
            'reason' => 'Changed mind',
        ]);

        ReturnItem::create([
            'return_id' => $return->id,
            'order_item_id' => $this->orderItem->id,
            'product_id' => $this->orderItem->product_id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 1,
            'unit_price' => 2000.00,
            'refund_amount' => 2000.00,
        ]);

        // 1. Transition to approved
        $statusRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/returns/{$return->id}/status", [
                'status' => 'approved',
                'notes' => 'Approved by quality team.',
            ]);

        $statusRes->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('returns', [
            'id' => $return->id,
            'status' => 'approved',
            'admin_notes' => 'Approved by quality team.',
        ]);

        // 2. Restock items into inventory
        $stockBefore = Inventory::where('product_variant_id', $this->variant->id)->value('available_qty');

        $restockRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/returns/{$return->id}/restock");

        $restockRes->assertStatus(200);

        $stockAfter = Inventory::where('product_variant_id', $this->variant->id)->value('available_qty');
        $this->assertEquals($stockBefore + 1, $stockAfter);

        // Double restock should fail with validation error
        $doubleRestock = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/returns/{$return->id}/restock");

        $doubleRestock->assertStatus(422);
    }

    public function test_admin_can_process_manual_bank_transfer_refund_with_snapshot_and_utr(): void
    {
        $bankAccount = CustomerBankAccount::create([
            'user_id' => $this->customer->id,
            'account_holder_name' => 'Alice Customer',
            'bank_name' => 'Axis Bank',
            'account_number' => '912010098765432',
            'ifsc_code' => 'UTIB0000123',
            'is_default' => true,
        ]);

        $return = ReturnRequest::create([
            'return_number' => 'RET-REFUND-01',
            'order_id' => $this->order->id,
            'user_id' => $this->customer->id,
            'bank_account_id' => $bankAccount->id,
            'bank_details_snapshot' => $bankAccount->toSnapshot(),
            'status' => 'approved_for_refund',
            'reason' => 'Defective piece',
        ]);

        $refundRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/refunds/process', [
                'order_id' => $this->order->id,
                'return_id' => $return->id,
                'amount' => 2000.00,
                'reason' => 'Customer bank transfer payout for RMA',
                'refund_channel' => 'bank_transfer',
                'bank_account_id' => $bankAccount->id,
                'transaction_reference' => 'UTR1234567890AXIS',
            ]);

        $refundRes->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'amount' => '2000.00',
                    'refund_channel' => 'bank_transfer',
                    'transaction_reference' => 'UTR1234567890AXIS',
                    'status' => 'completed',
                ],
            ]);

        $this->assertDatabaseHas('refunds', [
            'order_id' => $this->order->id,
            'refund_channel' => 'bank_transfer',
            'transaction_reference' => 'UTR1234567890AXIS',
            'status' => 'completed',
        ]);

        // Payment status should be updated to refunded
        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => 'refunded',
        ]);

        // Return status should be updated to refunded
        $this->assertDatabaseHas('returns', [
            'id' => $return->id,
            'status' => 'refunded',
        ]);
    }

    public function test_admin_cannot_refund_more_than_order_balance(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/refunds/process', [
                'order_id' => $this->order->id,
                'amount' => 5000.00, // Order total is only 2000.00
                'reason' => 'Excessive refund attempt',
                'refund_channel' => 'original_gateway',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_admin_can_view_refunds_stats_and_single_refund_detail(): void
    {
        $refund = Refund::create([
            'refund_number' => 'RFD-DET-01',
            'order_id' => $this->order->id,
            'amount' => 500.00,
            'reason' => 'Partial item discount adjustment',
            'gateway' => 'manual',
            'refund_channel' => 'store_credit',
            'status' => 'completed',
        ]);

        // Stats test
        $statsRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/refunds/stats');

        $statsRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_refunds_count' => 1,
                    'completed_refunds_count' => 1,
                ],
            ]);

        // Single detail test
        $detailRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/refunds/{$refund->id}");

        $detailRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'refund_number' => 'RFD-DET-01',
                    'refund_channel' => 'store_credit',
                ],
            ]);
    }

    public function test_admin_can_retry_failed_refund(): void
    {
        $refund = Refund::create([
            'refund_number' => 'RFD-FAIL-01',
            'order_id' => $this->order->id,
            'amount' => 1000.00,
            'reason' => 'Gateway network timeout',
            'gateway' => 'razorpay',
            'refund_channel' => 'original_gateway',
            'status' => 'failed',
        ]);

        $retryRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/refunds/{$refund->id}/retry");

        $retryRes->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('refunds', [
            'id' => $refund->id,
            'status' => 'completed',
        ]);
    }
}
