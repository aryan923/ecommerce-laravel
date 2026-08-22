<?php

namespace Tests\Feature\Admin;

use App\Jobs\SendEmailJob;
use App\Jobs\SendSmsJob;
use App\Models\AdminUser;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminFailedJobTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RbacSeeder']);

        $this->admin = AdminUser::create([
            'name' => 'Super Admin Test',
            'email' => 'admin_test_' . uniqid() . '@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('SecretPassword123!'),
            'status' => 'active',
        ]);

        $superAdminRole = Role::where('slug', 'super_admin')->first();
        if ($superAdminRole) {
            $this->admin->roles()->sync([$superAdminRole->id]);
        }
    }

    /** @test */
    public function unauthenticated_user_cannot_access_failed_jobs(): void
    {
        $response = $this->getJson('/api/v1/admin/failed-jobs');
        $response->assertStatus(401);
    }

    /** @test */
    public function super_admin_can_list_failed_jobs(): void
    {
        Sanctum::actingAs($this->admin);

        DB::table('failed_jobs')->insert([
            'uuid' => (string) Str::uuid(),
            'connection' => 'database',
            'queue' => 'emails',
            'payload' => json_encode(['displayName' => 'App\\Jobs\\SendEmailJob']),
            'exception' => 'RuntimeException: SMTP timeout',
            'failed_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/admin/failed-jobs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'failed_jobs',
                    'pagination',
                    'metrics',
                ],
            ]);
    }

    /** @test */
    public function super_admin_can_view_single_failed_job_detail(): void
    {
        Sanctum::actingAs($this->admin);

        $id = DB::table('failed_jobs')->insertGetId([
            'uuid' => (string) Str::uuid(),
            'connection' => 'database',
            'queue' => 'notifications',
            'payload' => json_encode(['displayName' => 'App\\Jobs\\SendSmsJob']),
            'exception' => 'Exception: SMS Gateway Timeout',
            'failed_at' => now(),
        ]);

        $response = $this->getJson("/api/v1/admin/failed-jobs/{$id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.queue', 'notifications')
            ->assertJsonPath('data.exception', 'Exception: SMS Gateway Timeout');
    }

    /** @test */
    public function super_admin_can_delete_failed_job(): void
    {
        Sanctum::actingAs($this->admin);

        $id = DB::table('failed_jobs')->insertGetId([
            'uuid' => (string) Str::uuid(),
            'connection' => 'database',
            'queue' => 'default',
            'payload' => json_encode(['displayName' => 'App\\Jobs\\TestJob']),
            'exception' => 'Error: Test error',
            'failed_at' => now(),
        ]);

        $response = $this->deleteJson("/api/v1/admin/failed-jobs/{$id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('failed_jobs', ['id' => $id]);
    }

    /** @test */
    public function super_admin_can_flush_all_failed_jobs(): void
    {
        Sanctum::actingAs($this->admin);

        DB::table('failed_jobs')->insert([
            'uuid' => (string) Str::uuid(),
            'connection' => 'database',
            'queue' => 'emails',
            'payload' => json_encode(['displayName' => 'App\\Jobs\\SendEmailJob']),
            'exception' => 'RuntimeException: SMTP failure',
            'failed_at' => now(),
        ]);

        $response = $this->deleteJson('/api/v1/admin/failed-jobs/flush');

        $response->assertStatus(200);
        $this->assertEquals(0, DB::table('failed_jobs')->count());
    }

    /** @test */
    public function queued_jobs_can_be_dispatched_and_asserted(): void
    {
        Queue::fake();

        SendEmailJob::dispatch('user@example.com', 'Test Email', 'Hello World');
        SendSmsJob::dispatch('+123456789', 'OTP Code: 1234');

        Queue::assertPushed(SendEmailJob::class, function ($job) {
            return $job->to === 'user@example.com';
        });

        Queue::assertPushed(SendSmsJob::class, function ($job) {
            return $job->mobile === '+123456789';
        });
    }
}
