<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isSuperAdmin() || $user->hasPermission('settings.update'));
    }

    public function rules(): array
    {
        $group = $this->route('group');

        return match ($group) {
            'general' => [
                'store_name' => 'sometimes|string|max:255',
                'store_email' => 'sometimes|email|max:255',
                'store_phone' => 'nullable|string|max:30',
                'store_address' => 'nullable|string|max:1000',
                'store_logo' => 'nullable|string|max:255',
                'store_favicon' => 'nullable|string|max:255',
                'store_gstin' => 'nullable|string|max:50',
                'store_hours' => 'nullable|string|max:255',
                'social_facebook' => 'nullable|string|max:255',
                'social_instagram' => 'nullable|string|max:255',
                'social_twitter' => 'nullable|string|max:255',
                'social_linkedin' => 'nullable|string|max:255',
                'support_portal_url' => 'nullable|string|max:255',
            ],
            'localization' => [
                'default_currency' => 'sometimes|string|size:3',
                'timezone' => 'sometimes|string|max:100',
                'date_format' => 'sometimes|string|in:Y-m-d,d/m/Y,m/d/Y,d-m-Y',
                'number_format' => 'sometimes|string|max:20',
                'default_language' => 'sometimes|string|max:10',
                'weight_unit' => 'sometimes|string|in:kg,g,lbs,oz',
                'dimension_unit' => 'sometimes|string|in:cm,m,in,ft',
                'multi_language_enabled' => 'sometimes|boolean',
            ],
            'commerce' => [
                'guest_checkout' => 'sometimes|boolean',
                'stock_management' => 'sometimes|boolean',
                'reviews_enabled' => 'sometimes|boolean',
                'min_order_value' => 'nullable|numeric|min:0',
                'max_order_value' => 'nullable|numeric|min:0|gte:min_order_value',
                'cart_reservation_ttl_minutes' => 'nullable|integer|min:1|max:1440',
                'unpaid_order_cancellation_hours' => 'nullable|integer|min:1|max:720',
                'free_shipping_threshold' => 'nullable|numeric|min:0',
                'low_stock_threshold_default' => 'nullable|integer|min:1',
                'products_per_page' => 'nullable|integer|min:1|max:100',
            ],
            'seo' => [
                'default_meta_title' => 'nullable|string|max:255',
                'default_meta_description' => 'nullable|string|max:1000',
                'default_og_image' => 'nullable|string|max:255',
                'sitemap_enabled' => 'sometimes|boolean',
                'robots_txt' => 'nullable|string|max:5000',
                'google_analytics_id' => 'nullable|string|max:50',
                'facebook_pixel_id' => 'nullable|string|max:50',
                'google_tag_manager_id' => 'nullable|string|max:50',
                'auto_sitemap_regeneration' => 'sometimes|boolean',
            ],
            'email' => [
                'mail_driver' => 'sometimes|string|in:smtp,mailgun,ses,sendgrid,postmark,log',
                'smtp_host' => 'nullable|string|max:255',
                'smtp_port' => 'nullable|integer|min:1|max:65535',
                'smtp_encryption' => 'nullable|string|in:tls,ssl,none',
                'smtp_username' => 'nullable|string|max:255',
                'smtp_password' => 'nullable|string|max:255',
                'from_name' => 'nullable|string|max:255',
                'from_email' => 'nullable|email|max:255',
            ],
            'payment' => [
                'razorpay_enabled' => 'sometimes|boolean',
                'stripe_enabled' => 'sometimes|boolean',
                'paypal_enabled' => 'sometimes|boolean',
                'cod_enabled' => 'sometimes|boolean',
                'bank_transfer_enabled' => 'sometimes|boolean',
                'razorpay_key' => 'nullable|string|max:255',
                'razorpay_secret' => 'nullable|string|max:255',
                'stripe_key' => 'nullable|string|max:255',
                'stripe_secret' => 'nullable|string|max:255',
                'max_cod_amount' => 'nullable|numeric|min:0',
                'cod_handling_fee' => 'nullable|numeric|min:0',
            ],
            'notifications_gateway' => [
                'sms_provider' => 'sometimes|string|in:msg91,twilio,fast2sms,disabled',
                'sms_api_key' => 'nullable|string|max:255',
                'sms_sender_id' => 'nullable|string|max:50',
                'whatsapp_enabled' => 'sometimes|boolean',
                'order_confirmation_sms' => 'sometimes|boolean',
                'dispatch_sms' => 'sometimes|boolean',
                'otp_sms' => 'sometimes|boolean',
            ],
            'security' => [
                'admin_2fa_required' => 'sometimes|boolean',
                'max_login_attempts' => 'nullable|integer|min:1|max:20',
                'session_timeout_minutes' => 'nullable|integer|min:5|max:1440',
                'maintenance_mode_enabled' => 'sometimes|boolean',
                'maintenance_message' => 'nullable|string|max:1000',
                'ip_whitelist' => 'nullable|string|max:1000',
            ],
            'shipping' => [
                'default_shipping_provider' => 'nullable|string|max:100',
                'free_shipping_threshold' => 'nullable|numeric|min:0',
                'enable_international_shipping' => 'sometimes|boolean',
            ],
            default => [
                '*' => 'nullable',
            ],
        };
    }
}
