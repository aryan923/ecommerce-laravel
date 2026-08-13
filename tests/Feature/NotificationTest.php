<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\User;
use App\Services\NotificationService;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected string $customerToken;
    protected AdminUser $admin;
    protected string $adminToken;
    protected NotificationService $notificationService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->customer = User::factory()->create(['email' => 'notify_customer@example.com', 'name' => 'Alice Smith']);
        $this->customerToken = $this->customer->createToken('customer_token')->plainTextToken;

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        $this->notificationService = app(NotificationService::class);
    }

    /**
     * Test admin can create a notification template with variables.
     */
    public function test_admin_can_create_notification_template_with_variables(): void
    {
        $payload = [
            'event' => 'order_placed',
            'channel' => 'email',
            'subject' => 'Order Confirmation {{order_number}}',
            'body' => 'Hello {{customer_name}}, your order {{order_number}} of total {{order_total}} has been placed.',
            'variables' => ['customer_name', 'order_number', 'order_total'],
            'status' => true,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/notifications/templates', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.event', 'order_placed')
            ->assertJsonPath('data.channel', 'email');

        $this->assertDatabaseHas('notification_templates', [
            'event' => 'order_placed',
            'channel' => 'email',
        ]);
    }

    /**
     * Test admin cannot create duplicate template for same event and channel.
     */
    public function test_admin_cannot_create_duplicate_template_for_same_event_and_channel(): void
    {
        NotificationTemplate::create([
            'event' => 'payment_success',
            'channel' => 'sms',
            'body' => 'Payment received.',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/notifications/templates', [
                'event' => 'payment_success',
                'channel' => 'sms',
                'body' => 'Duplicate body',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    /**
     * Test notification service dispatch interpolates variables and creates log records.
     */
    public function test_notification_service_dispatch_interpolates_variables_and_creates_logs(): void
    {
        NotificationTemplate::create([
            'event' => 'order_shipped',
            'channel' => 'email',
            'subject' => 'Shipped {{order_number}}',
            'body' => 'Dear {{customer_name}}, your package is shipped via {{courier}} tracking {{tracking_number}}.',
            'status' => true,
        ]);

        $logs = $this->notificationService->dispatch(
            'order_shipped',
            $this->customer->email,
            [
                'customer_name' => 'Alice Smith',
                'order_number' => 'ORD-9901',
                'courier' => 'FedEx',
                'tracking_number' => 'FDX12345',
            ],
            $this->customer,
            ['email']
        );

        $this->assertCount(1, $logs);
        $this->assertEquals('sent', $logs[0]->status);
        $this->assertEquals('Shipped ORD-9901', $logs[0]->subject);
        $this->assertStringContainsString('Dear Alice Smith, your package is shipped via FedEx tracking FDX12345.', $logs[0]->content);
    }

    /**
     * Test notification dispatch uses fallback message when custom template does not exist.
     */
    public function test_notification_dispatch_uses_fallback_when_template_not_found(): void
    {
        $logs = $this->notificationService->dispatch(
            'low_stock',
            'admin@example.com',
            ['sku' => 'SKU-LOW-1', 'qty' => 2],
            null,
            ['email']
        );

        $this->assertCount(1, $logs);
        $this->assertEquals('sent', $logs[0]->status);
        $this->assertDatabaseHas('notification_logs', [
            'event' => 'low_stock',
            'channel' => 'email',
        ]);
    }

    /**
     * Test customer can fetch in-app notifications and mark them as read.
     */
    public function test_customer_can_fetch_and_mark_in_app_notifications_as_read(): void
    {
        $log = NotificationLog::create([
            'event' => 'order_delivered',
            'channel' => 'in_app',
            'recipient' => $this->customer->email,
            'user_id' => $this->customer->id,
            'subject' => 'Order Delivered',
            'content' => 'Your order ORD-8812 has been delivered.',
            'status' => 'sent',
        ]);

        // List in-app notifications
        $listResp = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->getJson('/api/v1/customer/notifications');

        $listResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.data.0.id', $log->id);

        // Mark as read
        $readResp = $this->withHeader('Authorization', 'Bearer ' . $this->customerToken)
            ->patchJson("/api/v1/customer/notifications/{$log->id}/read");

        $readResp->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNotNull($log->fresh()->read_at);
    }

    /**
     * Test admin can trigger a test notification dispatch.
     */
    public function test_admin_can_trigger_test_dispatch(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/notifications/test-dispatch', [
                'event' => 'order_placed',
                'recipient' => 'test_dispatch@example.com',
                'data' => [
                    'customer_name' => 'Tester',
                    'order_number' => 'ORD-TEST-1',
                ],
                'channels' => ['email', 'in_app'],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('notification_logs', [
            'recipient' => 'test_dispatch@example.com',
            'event' => 'order_placed',
        ]);
    }
}
