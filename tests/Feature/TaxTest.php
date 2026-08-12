<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Product;
use App\Models\TaxClass;
use App\Models\TaxRate;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUser $admin;
    protected string $adminToken;
    protected TaxClass $standardTaxClass;
    protected Product $exclusiveProduct;
    protected Product $inclusiveProduct;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);

        $this->admin = AdminUser::where('email', 'admin@example.com')->first();
        $this->adminToken = $this->admin->createToken('admin_token')->plainTextToken;

        // Setup Tax Class: Standard GST 18%
        $this->standardTaxClass = TaxClass::create([
            'name' => 'Standard GST 18%',
            'description' => '18% GST for general electronics',
            'is_default' => true,
        ]);

        // Setup Rates: CGST 9% (MH), SGST 9% (MH), IGST 18%
        TaxRate::create([
            'tax_class_id' => $this->standardTaxClass->id,
            'name' => 'CGST 9%',
            'type' => 'cgst',
            'rate' => 9.0000,
            'state_code' => 'MH',
            'status' => 'active',
        ]);

        TaxRate::create([
            'tax_class_id' => $this->standardTaxClass->id,
            'name' => 'SGST 9%',
            'type' => 'sgst',
            'rate' => 9.0000,
            'state_code' => 'MH',
            'status' => 'active',
        ]);

        TaxRate::create([
            'tax_class_id' => $this->standardTaxClass->id,
            'name' => 'IGST 18%',
            'type' => 'igst',
            'rate' => 18.0000,
            'status' => 'active',
        ]);

        // Product with Tax Exclusive Pricing
        $this->exclusiveProduct = Product::create([
            'name' => 'Exclusive Price Laptop',
            'slug' => 'exclusive-price-laptop',
            'sku' => 'LAP-EXC-01',
            'price' => 1000.00,
            'tax_class_id' => $this->standardTaxClass->id,
            'status' => 'active',
        ]);

        // Setup Tax Class & Rate for Tax Inclusive Pricing
        $inclusiveTaxClass = TaxClass::create(['name' => 'Inclusive GST 18%']);
        TaxRate::create([
            'tax_class_id' => $inclusiveTaxClass->id,
            'name' => 'IGST 18% Inclusive',
            'type' => 'igst',
            'rate' => 18.0000,
            'is_inclusive' => true,
            'status' => 'active',
        ]);

        $this->inclusiveProduct = Product::create([
            'name' => 'Inclusive Price Phone',
            'slug' => 'inclusive-price-phone',
            'sku' => 'PHN-INC-01',
            'price' => 1180.00,
            'tax_class_id' => $inclusiveTaxClass->id,
            'status' => 'active',
        ]);
    }

    /**
     * Test admin can create a tax class.
     */
    public function test_admin_can_create_tax_class(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/tax-classes', [
                'name' => 'Reduced GST 5%',
                'description' => '5% rate for essential items',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('tax_classes', ['name' => 'Reduced GST 5%']);
    }

    /**
     * Test admin can create a tax rate.
     */
    public function test_admin_can_create_tax_rate(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->adminToken)
            ->postJson('/api/v1/admin/tax-rates', [
                'tax_class_id' => $this->standardTaxClass->id,
                'name' => 'Flat Cess 1%',
                'type' => 'flat',
                'rate' => 1.0000,
                'status' => 'active',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tax_rates', ['name' => 'Flat Cess 1%', 'rate' => 1.0000]);
    }

    /**
     * Test Intra-State GST calculation (Store Origin: MH, Customer: MH -> CGST 9% + SGST 9%).
     */
    public function test_calculate_intra_state_gst(): void
    {
        $response = $this->postJson('/api/v1/tax/calculate', [
            'origin_state_code' => 'MH',
            'shipping_state_code' => 'MH',
            'items' => [
                ['product_id' => $this->exclusiveProduct->id, 'amount' => 1000.00, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'jurisdiction' => [
                        'is_intra_state' => true,
                    ],
                    'subtotal' => 1000.00,
                    'cgst_amount' => 90.00,
                    'sgst_amount' => 90.00,
                    'igst_amount' => 0.00,
                    'total_tax' => 180.00,
                    'grand_total' => 1180.00,
                ],
            ]);
    }

    /**
     * Test Inter-State GST calculation (Store Origin: MH, Customer: KA -> IGST 18%).
     */
    public function test_calculate_inter_state_gst(): void
    {
        $response = $this->postJson('/api/v1/tax/calculate', [
            'origin_state_code' => 'MH',
            'shipping_state_code' => 'KA',
            'items' => [
                ['product_id' => $this->exclusiveProduct->id, 'amount' => 1000.00, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'jurisdiction' => [
                        'is_intra_state' => false,
                    ],
                    'subtotal' => 1000.00,
                    'cgst_amount' => 0.00,
                    'sgst_amount' => 0.00,
                    'igst_amount' => 180.00,
                    'total_tax' => 180.00,
                    'grand_total' => 1180.00,
                ],
            ]);
    }

    /**
     * Test Tax-Inclusive pricing calculation.
     */
    public function test_calculate_tax_inclusive_pricing(): void
    {
        $response = $this->postJson('/api/v1/tax/calculate', [
            'origin_state_code' => 'MH',
            'shipping_state_code' => 'KA',
            'items' => [
                ['product_id' => $this->inclusiveProduct->id, 'amount' => 1180.00, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'subtotal' => 1180.00,
                    'taxable_amount' => 1000.00,
                    'total_tax' => 180.00,
                    'grand_total' => 1180.00,
                ],
            ]);
    }

    /**
     * Test calculation for product without tax class defaults to 0 tax.
     */
    public function test_calculate_tax_for_product_without_tax_class(): void
    {
        $noTaxProduct = Product::create([
            'name' => 'Untaxed Item',
            'slug' => 'untaxed-item',
            'sku' => 'UNTAXED-01',
            'price' => 500.00,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/tax/calculate', [
            'shipping_state_code' => 'MH',
            'items' => [
                ['product_id' => $noTaxProduct->id, 'amount' => 500.00, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_tax' => 0.00,
                    'grand_total' => 500.00,
                ],
            ]);
    }
}
