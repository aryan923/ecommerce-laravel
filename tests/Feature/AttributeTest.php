<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Role;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttributeTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $superAdmin;
    protected string $superAdminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->superAdmin = AdminUser::where('email', 'admin@example.com')->first();
        $this->superAdminToken = $this->superAdmin->createToken('admin_token')->plainTextToken;
    }

    /**
     * Test Super Admin can create a new attribute.
     */
    public function test_super_admin_can_create_attribute(): void
    {
        $payload = [
            'name' => 'Color',
            'type' => 'color_picker',
            'is_filterable' => true,
            'status' => 'active',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson('/api/v1/admin/attributes', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Attribute created successfully.',
                'data' => [
                    'name' => 'Color',
                    'code' => 'color',
                    'type' => 'color_picker',
                ],
            ]);
    }

    /**
     * Test Super Admin can create an attribute value.
     */
    public function test_super_admin_can_create_attribute_value(): void
    {
        $attribute = Attribute::create(['name' => 'Size', 'type' => 'button']);

        $payload = [
            'value' => 'XL',
            'sort_order' => 1,
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson("/api/v1/admin/attributes/{$attribute->id}/values", $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'value' => 'XL',
                    'attribute_id' => $attribute->id,
                ],
            ]);
    }

    /**
     * Test Super Admin can list attributes with values count.
     */
    public function test_super_admin_can_list_attributes(): void
    {
        $attr = Attribute::create(['name' => 'Material']);
        AttributeValue::create(['attribute_id' => $attr->id, 'value' => 'Cotton']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->getJson('/api/v1/admin/attributes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'values_count'],
                ],
            ]);
    }

    /**
     * Test Super Admin can update an attribute value.
     */
    public function test_super_admin_can_update_attribute_value(): void
    {
        $attr = Attribute::create(['name' => 'Shade']);
        $value = AttributeValue::create(['attribute_id' => $attr->id, 'value' => 'Red', 'color_code' => '#FF0000']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->putJson("/api/v1/admin/attribute-values/{$value->id}", [
                'value' => 'Crimson Red',
                'color_code' => '#DC143C',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'value' => 'Crimson Red',
                    'color_code' => '#DC143C',
                ],
            ]);
    }

    /**
     * Test attribute value creation validates hex color code format.
     */
    public function test_attribute_value_creation_validates_hex_color_code(): void
    {
        $attribute = Attribute::create(['name' => 'Color']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->postJson("/api/v1/admin/attributes/{$attribute->id}/values", [
                'value' => 'Invalid Hex',
                'color_code' => 'NOT_A_HEX',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['color_code']);
    }

    /**
     * Test deleting attribute cascades deletion of its attribute values.
     */
    public function test_attribute_deletion_cascades_values(): void
    {
        $attr = Attribute::create(['name' => 'Storage']);
        $val = AttributeValue::create(['attribute_id' => $attr->id, 'value' => '128GB']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->superAdminToken)
            ->deleteJson("/api/v1/admin/attributes/{$attr->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('attributes', ['id' => $attr->id]);
        $this->assertDatabaseMissing('attribute_values', ['id' => $val->id]);
    }

    /**
     * Test public storefront can fetch active filterable attributes with values.
     */
    public function test_public_can_fetch_active_filterable_attributes(): void
    {
        $attr1 = Attribute::create(['name' => 'Filterable Attr', 'is_filterable' => true, 'status' => 'active']);
        AttributeValue::create(['attribute_id' => $attr1->id, 'value' => 'Value 1']);

        Attribute::create(['name' => 'Non Filterable Attr', 'is_filterable' => false, 'status' => 'active']);

        $response = $this->getJson('/api/v1/attributes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $names = collect($response->json('data'))->pluck('name')->toArray();
        $this->assertContains('Filterable Attr', $names);
        $this->assertNotContains('Non Filterable Attr', $names);
    }

    /**
     * Test unauthorized admin cannot create attribute.
     */
    public function test_unauthorized_admin_cannot_create_attribute(): void
    {
        $role = Role::where('slug', 'order_manager')->first();
        $staff = AdminUser::create([
            'name' => 'Order Staff',
            'email' => 'attr.staff@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);
        $staff->roles()->sync([$role->id]);

        $token = $staff->createToken('staff_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/attributes', [
                'name' => 'Forbidden Attribute',
            ]);

        $response->assertStatus(403);
    }
}
