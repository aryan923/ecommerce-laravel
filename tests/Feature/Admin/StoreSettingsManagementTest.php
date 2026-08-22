<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Currency;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SettingsAuditLog;
use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreSettingsManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'settings.view'], ['module' => 'settings', 'action' => 'view']);
        $permUpdate = Permission::firstOrCreate(['name' => 'settings.update'], ['module' => 'settings', 'action' => 'update']);
        $permConfigure = Permission::firstOrCreate(['name' => 'settings.configure'], ['module' => 'settings', 'action' => 'configure']);
        $permCurrView = Permission::firstOrCreate(['name' => 'currency.view'], ['module' => 'currency', 'action' => 'view']);
        $permCurrManage = Permission::firstOrCreate(['name' => 'currency.manage'], ['module' => 'currency', 'action' => 'manage']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([
            $permView->id,
            $permUpdate->id,
            $permConfigure->id,
            $permCurrView->id,
            $permCurrManage->id,
        ]);

        $this->adminUser = AdminUser::create([
            'name' => 'Settings Admin',
            'email' => 'settings_admin@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->sync([$role->id]);
    }

    public function test_unauthenticated_user_cannot_access_settings()
    {
        $response = $this->getJson('/api/v1/admin/settings');
        $response->assertStatus(401);
    }

    public function test_admin_can_retrieve_all_grouped_settings()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/settings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['general', 'localization', 'commerce', 'seo']]);
    }

    public function test_admin_can_retrieve_specific_group_settings()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/settings/general');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['store_name', 'store_email']]);
    }

    public function test_admin_can_update_general_settings_group()
    {
        $payload = [
            'store_name' => 'Updated Acme Store',
            'store_email' => 'admin@acme.com',
            'store_phone' => '+1-800-999-8888',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/settings/general', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.store_name', 'Updated Acme Store');

        $this->assertDatabaseHas('store_settings', [
            'key' => 'store_name',
            'value' => 'Updated Acme Store',
        ]);
    }

    public function test_admin_can_update_commerce_settings_group()
    {
        $payload = [
            'guest_checkout' => false,
            'min_order_value' => 250,
            'max_order_value' => 50000,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/settings/commerce', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.guest_checkout', false)
            ->assertJsonPath('data.min_order_value', 250);
    }

    public function test_admin_can_list_currencies()
    {
        Currency::create([
            'code' => 'INR',
            'name' => 'Indian Rupee',
            'symbol' => '₹',
            'exchange_rate' => 1.000000,
            'is_default' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/currencies');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_create_currency()
    {
        $payload = [
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'exchange_rate' => 0.012000,
            'decimal_places' => 2,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/currencies', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'USD');

        $this->assertDatabaseHas('currencies', ['code' => 'USD']);
    }

    public function test_admin_can_set_default_currency()
    {
        $inr = Currency::create([
            'code' => 'INR',
            'name' => 'Indian Rupee',
            'symbol' => '₹',
            'exchange_rate' => 1.0,
            'is_default' => true,
        ]);

        $usd = Currency::create([
            'code' => 'USD',
            'name' => 'US Dollar',
            'symbol' => '$',
            'exchange_rate' => 0.012,
            'is_default' => false,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/currencies/{$usd->id}/set-default");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_default', true);

        $this->assertDatabaseHas('currencies', ['id' => $usd->id, 'is_default' => 1, 'exchange_rate' => 1.0]);
        $this->assertDatabaseHas('currencies', ['id' => $inr->id, 'is_default' => 0]);
    }

    public function test_cannot_delete_default_currency()
    {
        $curr = Currency::create([
            'code' => 'INR',
            'name' => 'Indian Rupee',
            'symbol' => '₹',
            'exchange_rate' => 1.0,
            'is_default' => true,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/currencies/{$curr->id}");

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_delete_non_default_currency()
    {
        $curr = Currency::create([
            'code' => 'EUR',
            'name' => 'Euro',
            'symbol' => '€',
            'exchange_rate' => 0.011,
            'is_default' => false,
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/v1/admin/currencies/{$curr->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('currencies', ['id' => $curr->id]);
    }

    public function test_audit_logs_recorded_on_settings_update()
    {
        $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/settings/general', ['store_name' => 'Audit Test Store']);

        $this->assertDatabaseHas('settings_audit_logs', [
            'group' => 'general',
            'action' => 'settings_updated',
        ]);
    }
}
