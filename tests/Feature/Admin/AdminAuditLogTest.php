<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuditLogTest extends TestCase
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
    public function unauthenticated_user_cannot_access_audit_logs(): void
    {
        $response = $this->getJson('/api/v1/admin/audit-logs');
        $response->assertStatus(401);
    }

    /** @test */
    public function super_admin_can_list_audit_logs_with_pagination(): void
    {
        Sanctum::actingAs($this->admin);

        AuditLog::create([
            'actor_id' => $this->admin->id,
            'actor_name' => $this->admin->name,
            'actor_email' => $this->admin->email,
            'action' => 'admin.create',
            'module' => 'staff',
            'entity_type' => AdminUser::class,
            'entity_id' => '10',
            'old_values' => null,
            'new_values' => ['name' => 'John Staff'],
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'logs',
                    'pagination',
                    'metrics',
                ],
            ]);
    }

    /** @test */
    public function super_admin_can_filter_audit_logs_by_module(): void
    {
        Sanctum::actingAs($this->admin);

        AuditLog::create([
            'actor_id' => $this->admin->id,
            'actor_name' => $this->admin->name,
            'actor_email' => $this->admin->email,
            'action' => 'admin.create',
            'module' => 'staff',
            'ip_address' => '127.0.0.1',
        ]);

        AuditLog::create([
            'actor_id' => $this->admin->id,
            'actor_name' => $this->admin->name,
            'actor_email' => $this->admin->email,
            'action' => 'setting.update',
            'module' => 'settings',
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->getJson('/api/v1/admin/audit-logs?module=staff');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.logs')
            ->assertJsonPath('data.logs.0.module', 'staff');
    }

    /** @test */
    public function super_admin_can_retrieve_single_audit_log_detail(): void
    {
        Sanctum::actingAs($this->admin);

        $log = AuditLog::create([
            'actor_id' => $this->admin->id,
            'actor_name' => $this->admin->name,
            'actor_email' => $this->admin->email,
            'action' => 'role.update',
            'module' => 'roles',
            'old_values' => ['name' => 'Old Role'],
            'new_values' => ['name' => 'Updated Role'],
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->getJson("/api/v1/admin/audit-logs/{$log->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.action', 'role.update')
            ->assertJsonPath('data.new_values.name', 'Updated Role');
    }

    /** @test */
    public function super_admin_can_export_audit_logs_csv(): void
    {
        Sanctum::actingAs($this->admin);

        AuditLog::create([
            'actor_id' => $this->admin->id,
            'actor_name' => $this->admin->name,
            'actor_email' => $this->admin->email,
            'action' => 'admin.create',
            'module' => 'staff',
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->get('/api/v1/admin/audit-logs/export');

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('content-type'), 'text/csv'));
    }

    /** @test */
    public function staff_action_triggers_automatic_audit_log(): void
    {
        Sanctum::actingAs($this->admin);

        $role = Role::firstOrCreate(['slug' => 'test_audit_role'], ['name' => 'Test Audit Role']);

        $response = $this->postJson('/api/v1/admin/users', [
            'name' => 'Audit Staff Test',
            'email' => 'auditstaff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
            'role_ids' => [$role->id],
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'staff',
            'action' => 'admin.create',
        ]);
    }

    /** @test */
    public function role_action_triggers_automatic_audit_log(): void
    {
        Sanctum::actingAs($this->admin);

        $perm = Permission::firstOrCreate(['name' => 'products.view'], ['module' => 'products', 'action' => 'view']);

        $response = $this->postJson('/api/v1/admin/roles', [
            'name' => 'Audit Custom Role Unique',
            'description' => 'Role for audit testing',
            'permission_ids' => [$perm->id],
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('audit_logs', [
            'module' => 'roles',
            'action' => 'role.create',
        ]);
    }
}
