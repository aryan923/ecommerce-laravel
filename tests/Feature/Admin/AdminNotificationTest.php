<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first() ?? AdminUser::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_notification_endpoints(): void
    {
        $response = $this->getJson('/api/v1/admin/notifications/stats');
        $response->assertStatus(401);
    }

    public function test_admin_can_fetch_notification_stats(): void
    {
        NotificationTemplate::create([
            'event' => 'order_placed',
            'channel' => 'email',
            'subject' => 'Order Confirmation - #{{order_number}}',
            'body' => 'Thank you for your order!',
            'status' => true,
        ]);

        NotificationLog::create([
            'event' => 'order_placed',
            'channel' => 'email',
            'recipient' => 'test@example.com',
            'content' => 'Thank you for your order!',
            'status' => 'delivered',
            'sent_at' => now(),
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/notifications/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_templates' => 1,
                    'active_templates' => 1,
                    'total_logs' => 1,
                    'sent_logs' => 1,
                ]
            ]);
    }

    public function test_admin_can_list_and_filter_notification_templates(): void
    {
        NotificationTemplate::create([
            'event' => 'order_shipped',
            'channel' => 'sms',
            'body' => 'Your package has shipped!',
            'status' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/notifications/templates?channel=sms');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('order_shipped', $response->json('data.0.event'));
    }

    public function test_admin_can_create_notification_template(): void
    {
        $payload = [
            'event' => 'return_requested',
            'channel' => 'email',
            'subject' => 'Return Request Received - #{{order_number}}',
            'body' => 'Hi {{customer_name}}, we received your return request.',
            'variables' => ['customer_name', 'order_number'],
            'status' => true,
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/notifications/templates', $payload);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('notification_templates', [
            'event' => 'return_requested',
            'channel' => 'email',
        ]);
    }

    public function test_admin_can_update_and_toggle_notification_template(): void
    {
        $template = NotificationTemplate::create([
            'event' => 'refund_processed',
            'channel' => 'email',
            'subject' => 'Old Subject',
            'body' => 'Old body text',
            'status' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/admin/notifications/templates/{$template->id}", [
                'subject' => 'Updated Refund Subject',
                'body' => 'Updated refund body text',
                'status' => true,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('notification_templates', [
            'id' => $template->id,
            'subject' => 'Updated Refund Subject',
        ]);

        // Toggle status
        $toggleRes = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/notifications/templates/{$template->id}/toggle-status");

        $toggleRes->assertStatus(200);
        $this->assertDatabaseHas('notification_templates', [
            'id' => $template->id,
            'status' => false,
        ]);
    }

    public function test_admin_can_send_test_dispatch_notification(): void
    {
        $template = NotificationTemplate::create([
            'event' => 'order_placed',
            'channel' => 'email',
            'subject' => 'Order Confirmation - #{{order_number}}',
            'body' => 'Hello {{customer_name}}, order #{{order_number}} is confirmed!',
            'status' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/notifications/test-dispatch', [
                'template_id' => $template->id,
                'recipient' => 'testuser@example.com',
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('notification_logs', [
            'event' => 'order_placed',
            'recipient' => 'testuser@example.com',
            'status' => 'sent',
        ]);
    }

    public function test_admin_can_list_and_retry_notification_logs(): void
    {
        $log = NotificationLog::create([
            'event' => 'otp_verify',
            'channel' => 'sms',
            'recipient' => '+15550001111',
            'content' => 'Your code is 123456',
            'status' => 'failed',
            'failure_reason' => 'SMS Gateway Timeout',
        ]);

        $listRes = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/notifications/logs?status=failed');

        $listRes->assertStatus(200);
        $this->assertCount(1, $listRes->json('data'));

        // Retry log
        $retryRes = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/notifications/logs/{$log->id}/retry");

        $retryRes->assertStatus(200);
        $this->assertDatabaseHas('notification_logs', [
            'id' => $log->id,
            'status' => 'sent',
            'failure_reason' => null,
        ]);
    }
}
