<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\NotificationLog;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminNotificationEnhancementsTest extends TestCase
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

    public function test_admin_can_fetch_analytics_health_report(): void
    {
        NotificationLog::create([
            'event' => 'order_shipped',
            'channel' => 'email',
            'recipient' => 'test@example.com',
            'content' => 'Shipped',
            'status' => 'delivered',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/notifications/analytics');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'delivery_success_rate' => 100,
                ]
            ]);
    }

    public function test_admin_can_export_notification_logs_csv(): void
    {
        NotificationLog::create([
            'event' => 'order_placed',
            'channel' => 'email',
            'recipient' => 'customer@example.com',
            'content' => 'Order Received',
            'status' => 'delivered',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->get('/api/v1/admin/notifications/export-logs');

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'text/csv'));
    }

    public function test_admin_can_create_and_execute_broadcast_campaign(): void
    {
        $payload = [
            'title' => 'Spring Sale Announcement',
            'channel' => 'email',
            'target_segment' => 'all',
            'subject' => 'Spring Sale is Live!',
            'content' => 'Enjoy 20% OFF all items!',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/notifications/campaigns', $payload);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('notification_campaigns', [
            'title' => 'Spring Sale Announcement',
            'channel' => 'email',
        ]);
    }
}
