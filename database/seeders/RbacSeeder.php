<?php

namespace Database\Seeders;

use App\Models\AdminUser;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define & Create Module Permissions
        $modules = [
            'products' => ['view', 'create', 'update', 'delete'],
            'categories' => ['view', 'create', 'update', 'delete'],
            'brands' => ['view', 'create', 'update', 'delete'],
            'attributes' => ['view', 'create', 'update', 'delete'],
            'inventory' => ['view', 'update', 'adjust'],
            'orders' => ['view', 'update', 'cancel', 'refund'],
            'customers' => ['view', 'update', 'status'],
            'coupons' => ['view', 'create', 'update', 'delete'],
            'shipping' => ['view', 'update'],
            'tax' => ['view', 'create', 'update', 'delete', 'configure'],
            'taxes' => ['view', 'create', 'update', 'delete', 'configure'],
            'reviews' => ['view', 'moderate'],
            'reports' => ['view', 'export'],
            'cms' => ['view', 'create', 'update', 'delete'],
            'notifications' => ['view', 'update'],
            'staff' => ['view', 'create', 'update', 'delete'],
            'roles' => ['view', 'create', 'update', 'delete'],
            'media' => ['view', 'create', 'update', 'delete'],
            'audit_logs' => ['view'],
            'audit-logs' => ['view', 'export'],
            'settings' => ['view', 'update', 'configure'],
            'currency' => ['view', 'create', 'update', 'delete', 'manage'],
        ];

        $allPermissions = [];
        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                $permissionName = "{$module}.{$action}";
                $allPermissions[$permissionName] = Permission::firstOrCreate(
                    ['name' => $permissionName],
                    [
                        'module' => $module,
                        'action' => $action,
                        'description' => ucfirst($action) . " permission for " . ucfirst($module),
                    ]
                );
            }
        }

        // 2. Define & Create System Roles
        $superAdminRole = Role::firstOrCreate(
            ['slug' => 'super_admin'],
            [
                'name' => 'Super Administrator',
                'description' => 'Full access to all system features and settings.',
                'is_system' => true,
            ]
        );

        $storeManagerRole = Role::firstOrCreate(
            ['slug' => 'store_manager'],
            [
                'name' => 'Store Manager',
                'description' => 'Manages products, categories, orders, inventory, and reports.',
                'is_system' => true,
            ]
        );

        $orderManagerRole = Role::firstOrCreate(
            ['slug' => 'order_manager'],
            [
                'name' => 'Order Manager',
                'description' => 'Manages order processing, shipments, and customer communication.',
                'is_system' => true,
            ]
        );

        $productManagerRole = Role::firstOrCreate(
            ['slug' => 'product_manager'],
            [
                'name' => 'Product Manager',
                'description' => 'Manages catalog products, categories, brands, and media.',
                'is_system' => true,
            ]
        );

        // Assign permissions to roles
        $superAdminRole->permissions()->sync(array_column($allPermissions, 'id'));

        $productPermissions = Permission::whereIn('module', ['products', 'categories', 'brands', 'attributes'])->pluck('id');
        $productManagerRole->permissions()->sync($productPermissions);

        $orderPermissions = Permission::whereIn('module', ['orders', 'customers', 'shipping'])->pluck('id');
        $orderManagerRole->permissions()->sync($orderPermissions);

        // 3. Create Initial Super Admin User
        $superAdminUser = AdminUser::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'mobile' => '+19999999999',
                'password' => Hash::make('SecretAdmin123!'),
                'status' => 'active',
            ]
        );

        $superAdminUser->roles()->sync([$superAdminRole->id]);
    }
}
