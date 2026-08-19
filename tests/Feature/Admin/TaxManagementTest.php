<?php

namespace Tests\Feature\Admin;

use App\Models\AdminUser;
use App\Models\Permission;
use App\Models\Role;
use App\Models\TaxClass;
use App\Models\TaxRate;
use App\Models\TaxSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxManagementTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $permView = Permission::firstOrCreate(['name' => 'tax.view'], ['module' => 'tax', 'action' => 'view']);
        $permCreate = Permission::firstOrCreate(['name' => 'tax.create'], ['module' => 'tax', 'action' => 'create']);
        $permUpdate = Permission::firstOrCreate(['name' => 'tax.update'], ['module' => 'tax', 'action' => 'update']);
        $permDelete = Permission::firstOrCreate(['name' => 'tax.delete'], ['module' => 'tax', 'action' => 'delete']);
        $permConfigure = Permission::firstOrCreate(['name' => 'tax.configure'], ['module' => 'tax', 'action' => 'configure']);

        $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $role->permissions()->sync([
            $permView->id,
            $permCreate->id,
            $permUpdate->id,
            $permDelete->id,
            $permConfigure->id,
        ]);

        $this->adminUser = AdminUser::create([
            'name' => 'Tax Admin',
            'email' => 'tax_admin@example.com',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $this->adminUser->roles()->sync([$role->id]);
    }

    public function test_unauthenticated_user_cannot_access_tax_classes()
    {
        $response = $this->getJson('/api/v1/admin/tax-classes');
        $response->assertStatus(401);
    }

    public function test_admin_can_list_tax_classes()
    {
        TaxClass::create([
            'name' => 'Standard GST 18%',
            'code' => 'GST_18',
            'description' => '18% tax tier',
            'is_default' => true,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/tax-classes');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_create_tax_class()
    {
        $payload = [
            'name' => 'Luxury Goods 28%',
            'code' => 'GST_28',
            'description' => 'Luxury tax tier',
            'is_default' => false,
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/tax-classes', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Luxury Goods 28%');

        $this->assertDatabaseHas('tax_classes', ['code' => 'GST_28']);
    }

    public function test_admin_can_create_tax_class_with_quick_gst_rates()
    {
        $payload = [
            'name' => 'Electronic Goods 18%',
            'code' => 'ELEC_18',
            'cgst_rate' => 9.00,
            'sgst_rate' => 9.00,
            'igst_rate' => 18.00,
            'state_code' => 'MH',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/tax-classes', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('tax_rates', ['type' => 'cgst', 'rate' => 9.0000]);
        $this->assertDatabaseHas('tax_rates', ['type' => 'sgst', 'rate' => 9.0000]);
        $this->assertDatabaseHas('tax_rates', ['type' => 'igst', 'rate' => 18.0000]);
    }

    public function test_admin_can_set_default_tax_class()
    {
        $class1 = TaxClass::create(['name' => 'Class One', 'code' => 'C1', 'is_default' => true]);
        $class2 = TaxClass::create(['name' => 'Class Two', 'code' => 'C2', 'is_default' => false]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson("/api/v1/admin/tax-classes/{$class2->id}/set-default");

        $response->assertStatus(200);

        $this->assertDatabaseHas('tax_classes', ['id' => $class1->id, 'is_default' => 0]);
        $this->assertDatabaseHas('tax_classes', ['id' => $class2->id, 'is_default' => 1]);
    }

    public function test_admin_can_create_gst_component_rate()
    {
        $taxClass = TaxClass::create(['name' => 'Standard 18%', 'code' => 'STD_18']);

        $payload = [
            'tax_class_id' => $taxClass->id,
            'name' => 'CGST 9%',
            'type' => 'cgst',
            'rate' => 9.00,
            'state_code' => 'MH',
            'country_code' => 'IN',
            'is_active' => true,
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/tax-rates', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'CGST 9%');

        $this->assertDatabaseHas('tax_rates', ['name' => 'CGST 9%']);
    }

    public function test_admin_can_update_global_tax_settings()
    {
        $payload = [
            'pricing_mode' => 'tax_inclusive',
            'store_gstin' => '27AAAAA0000A1Z5',
            'store_state_code' => 'MH',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/tax/settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.pricing_mode', 'tax_inclusive');

        $this->assertDatabaseHas('tax_settings', ['pricing_mode' => 'tax_inclusive']);
    }

    public function test_admin_can_view_tax_audit_logs()
    {
        $taxClass = TaxClass::create(['name' => 'Audited Tax', 'code' => 'AUDIT_01']);

        $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/v1/admin/tax-classes/{$taxClass->id}", ['name' => 'Audited Tax Updated']);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/tax/audit-logs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('tax_audit_logs', ['action' => 'tax_class_updated']);
    }

    public function test_admin_can_manage_hsn_codes()
    {
        $payload = [
            'code' => '8517',
            'description' => 'Mobile phones',
            'type' => 'hsn',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/v1/admin/tax/hsn-codes', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.code', '8517');

        $this->assertDatabaseHas('hsn_codes', ['code' => '8517']);
    }

    public function test_admin_can_generate_gst_tax_report()
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/v1/admin/tax/reports?start_date=2026-01-01&end_date=2026-12-31');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['period', 'summary', 'hsn_summary']]);
    }
}
