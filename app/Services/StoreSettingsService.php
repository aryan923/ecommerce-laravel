<?php

namespace App\Services;

use App\Models\Currency;
use App\Models\SettingsAuditLog;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StoreSettingsService
{
    protected const CACHE_KEY = 'store_settings_all';

    /**
     * Default default values for initial store setup
     */
    protected array $defaults = [
        'general' => [
            'store_name' => 'Laravel E-Commerce',
            'store_email' => 'support@example.com',
            'store_phone' => '+1-800-555-0199',
            'store_address' => '123 E-Commerce Way, Tech City, TC 10001',
            'store_logo' => '/images/logo.png',
            'store_favicon' => '/favicon.ico',
            'store_gstin' => '27AAAAA0000A1Z5',
            'store_hours' => 'Mon-Sat: 9:00 AM - 8:00 PM IST',
            'social_facebook' => 'https://facebook.com/store',
            'social_instagram' => 'https://instagram.com/store',
            'social_twitter' => 'https://x.com/store',
            'social_linkedin' => 'https://linkedin.com/company/store',
            'support_portal_url' => 'https://support.example.com',
        ],
        'localization' => [
            'default_currency' => 'INR',
            'timezone' => 'Asia/Kolkata',
            'date_format' => 'Y-m-d',
            'number_format' => '1,234.56',
            'default_language' => 'en',
            'weight_unit' => 'kg',
            'dimension_unit' => 'cm',
            'multi_language_enabled' => false,
        ],
        'commerce' => [
            'guest_checkout' => true,
            'stock_management' => true,
            'reviews_enabled' => true,
            'min_order_value' => 0,
            'max_order_value' => 1000000,
            'cart_reservation_ttl_minutes' => 15,
            'unpaid_order_cancellation_hours' => 24,
            'free_shipping_threshold' => 999,
            'low_stock_threshold_default' => 5,
        ],
        'seo' => [
            'default_meta_title' => 'Laravel E-Commerce Store',
            'default_meta_description' => 'The best place to buy premium products online.',
            'default_og_image' => '/images/og-default.jpg',
            'sitemap_enabled' => true,
            'robots_txt' => "User-agent: *\nDisallow: /admin/\nDisallow: /checkout/",
            'google_analytics_id' => 'G-SAMPLE12345',
            'facebook_pixel_id' => '123456789012345',
            'google_tag_manager_id' => 'GTM-SAMPLE',
            'auto_sitemap_regeneration' => true,
        ],
        'email' => [
            'mail_driver' => 'smtp',
            'smtp_host' => 'smtp.mailtrap.io',
            'smtp_port' => 2525,
            'smtp_encryption' => 'tls',
            'smtp_username' => 'sample_user',
            'smtp_password' => 'sample_password',
            'from_name' => 'Acme Store Support',
            'from_email' => 'support@example.com',
        ],
        'payment' => [
            'razorpay_enabled' => true,
            'stripe_enabled' => true,
            'paypal_enabled' => false,
            'cod_enabled' => true,
            'bank_transfer_enabled' => false,
            'razorpay_key' => 'rzp_test_samplekey123',
            'razorpay_secret' => 'rzp_secret_sample123',
            'stripe_key' => 'pk_test_samplekey123',
            'stripe_secret' => 'sk_test_samplekey123',
            'max_cod_amount' => 50000,
            'cod_handling_fee' => 50,
        ],
        'notifications_gateway' => [
            'sms_provider' => 'msg91',
            'sms_api_key' => 'sample_sms_api_key',
            'sms_sender_id' => 'ACMSTR',
            'whatsapp_enabled' => true,
            'order_confirmation_sms' => true,
            'dispatch_sms' => true,
            'otp_sms' => true,
        ],
        'security' => [
            'admin_2fa_required' => false,
            'max_login_attempts' => 5,
            'session_timeout_minutes' => 30,
            'maintenance_mode_enabled' => false,
            'maintenance_message' => 'Store is currently under scheduled maintenance. We will be back online shortly.',
            'ip_whitelist' => '127.0.0.1',
        ],
        'shipping' => [
            'default_shipping_provider' => 'standard',
            'free_shipping_threshold' => 1000,
            'enable_international_shipping' => false,
        ],
    ];

    /**
     * Get all settings grouped by category
     */
    public function getAllSettingsGrouped(bool $maskSecrets = true): array
    {
        return Cache::remember(self::CACHE_KEY, 3600, function () use ($maskSecrets) {
            $dbSettings = StoreSetting::all()->groupBy('group');
            $result = [];

            foreach ($this->defaults as $group => $defaultValues) {
                $result[$group] = $defaultValues;

                if (isset($dbSettings[$group])) {
                    foreach ($dbSettings[$group] as $setting) {
                        $result[$group][$setting->key] = $setting->typed_value;
                    }
                }

                if ($maskSecrets) {
                    foreach ($result[$group] as $key => $val) {
                        if ($this->isSecretKey($key) && !empty($val) && is_string($val)) {
                            $result[$group][$key] = '********';
                        }
                    }
                }
            }

            return $result;
        });
    }

    /**
     * Get settings for a specific group
     */
    public function getSettingsByGroup(string $group, bool $maskSecrets = true): array
    {
        $all = $this->getAllSettingsGrouped($maskSecrets);
        return $all[$group] ?? [];
    }

    /**
     * Bulk update settings for a specific group
     */
    public function updateSettingsGroup(string $group, array $data, ?int $adminUserId = null, ?string $ipAddress = null): array
    {
        return DB::transaction(function () use ($group, $data, $adminUserId, $ipAddress) {
            $oldValues = $this->getSettingsByGroup($group, false);
            $updatedKeys = [];

            foreach ($data as $key => $value) {
                // Ignore masked password/secret submission if unchanged
                if ($value === '********' && $this->isSecretKey($key)) {
                    continue;
                }

                $type = $this->determineDataType($value);
                $stringValue = match ($type) {
                    'boolean' => $value ? '1' : '0',
                    'json' => json_encode($value),
                    default => (string) $value,
                };

                StoreSetting::updateOrCreate(
                    ['key' => $key],
                    [
                        'group' => $group,
                        'value' => $stringValue,
                        'type' => $type,
                    ]
                );

                $updatedKeys[$key] = $value;
            }

            // Invalidate settings cache
            Cache::forget(self::CACHE_KEY);

            $newValues = $this->getSettingsByGroup($group, false);

            // Audit log
            SettingsAuditLog::create([
                'admin_user_id' => $adminUserId,
                'group' => $group,
                'action' => 'settings_updated',
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => $ipAddress,
            ]);

            AuditLogService::log(
                module: 'settings',
                action: 'setting.update',
                entityType: 'StoreSetting',
                entityId: $group,
                oldValues: $oldValues,
                newValues: $newValues
            );

            return $newValues;
        });
    }

    /**
     * Set a currency as store default
     */
    public function setDefaultCurrency(Currency $currency, ?int $adminUserId = null, ?string $ipAddress = null): Currency
    {
        return DB::transaction(function () use ($currency, $adminUserId, $ipAddress) {
            $oldDefault = Currency::where('is_default', true)->first();

            Currency::query()->update(['is_default' => false]);

            $currency->update([
                'is_default' => true,
                'exchange_rate' => 1.000000,
                'status' => 'active',
            ]);

            // Update localization default_currency setting
            $this->updateSettingsGroup('localization', [
                'default_currency' => $currency->code,
            ], $adminUserId, $ipAddress);

            SettingsAuditLog::create([
                'admin_user_id' => $adminUserId,
                'group' => 'currency',
                'action' => 'currency_default_changed',
                'old_values' => ['default_currency_id' => $oldDefault?->id, 'code' => $oldDefault?->code],
                'new_values' => ['default_currency_id' => $currency->id, 'code' => $currency->code],
                'ip_address' => $ipAddress,
            ]);

            return $currency->fresh();
        });
    }

    /**
     * Get paginated audit logs
     */
    public function getAuditLogs(?string $group = null, int $perPage = 15)
    {
        $query = SettingsAuditLog::with('adminUser:id,name,email')
            ->orderBy('created_at', 'desc');

        if ($group) {
            $query->where('group', $group);
        }

        return $query->paginate($perPage);
    }

    /**
     * Helper to check secret keys
     */
    protected function isSecretKey(string $key): bool
    {
        $secretPatterns = ['secret', 'api_key', 'private_key', 'token', 'password'];
        foreach ($secretPatterns as $pattern) {
            if (str_contains(strtolower($key), $pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Determine data type for value casting
     */
    protected function determineDataType(mixed $value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }
        if (is_int($value)) {
            return 'integer';
        }
        if (is_float($value)) {
            return 'float';
        }
        if (is_array($value)) {
            return 'json';
        }
        return 'string';
    }
}
