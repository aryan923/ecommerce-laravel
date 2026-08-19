<?php

namespace Database\Seeders;

use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Seed sample notification templates & delivery audit logs into the database.
     */
    public function run(): void
    {
        $templates = [
            [
                'event' => 'order_placed',
                'channel' => 'email',
                'subject' => 'Order Confirmation - #{{order_number}}',
                'body' => "Hi {{customer_name}},\n\nThank you for your order! We have received order #{{order_number}} for a total of {{order_total}}.\n\nWe will notify you once your order has shipped.\n\nBest regards,\n{{store_name}} Team",
                'variables' => ['customer_name', 'order_number', 'order_total', 'store_name'],
                'status' => true,
            ],
            [
                'event' => 'order_shipped',
                'channel' => 'email',
                'subject' => 'Your Order #{{order_number}} Has Shipped!',
                'body' => "Hello {{customer_name}},\n\nGreat news! Your package for order #{{order_number}} has been dispatched via {{carrier_name}}.\n\nTracking Number: {{tracking_number}}\n\nThank you for shopping with {{store_name}}!",
                'variables' => ['customer_name', 'order_number', 'tracking_number', 'carrier_name', 'store_name'],
                'status' => true,
            ],
            [
                'event' => 'order_shipped',
                'channel' => 'sms',
                'subject' => null,
                'body' => 'Your {{store_name}} order #{{order_number}} has shipped via {{carrier_name}}. Track package with {{tracking_number}}.',
                'variables' => ['store_name', 'order_number', 'carrier_name', 'tracking_number'],
                'status' => true,
            ],
            [
                'event' => 'otp_verify',
                'channel' => 'sms',
                'subject' => null,
                'body' => 'Your {{store_name}} security verification code is {{otp_code}}. Do not share this code with anyone.',
                'variables' => ['store_name', 'otp_code'],
                'status' => true,
            ],
            [
                'event' => 'refund_processed',
                'channel' => 'email',
                'subject' => 'Refund Processed for Order #{{order_number}}',
                'body' => "Dear {{customer_name}},\n\nA refund of {{order_total}} for order #{{order_number}} has been processed successfully to your original payment method.\n\nIf you have questions, contact us at {{support_email}}.",
                'variables' => ['customer_name', 'order_number', 'order_total', 'support_email'],
                'status' => true,
            ],
            [
                'event' => 'review_approved',
                'channel' => 'push',
                'subject' => 'Your Product Review is Live!',
                'body' => 'Thank you {{customer_name}}! Your review for order #{{order_number}} has been approved and published on {{store_name}}.',
                'variables' => ['customer_name', 'order_number', 'store_name'],
                'status' => true,
            ],
        ];

        foreach ($templates as $tpl) {
            NotificationTemplate::updateOrCreate(
                [
                    'event' => $tpl['event'],
                    'channel' => $tpl['channel'],
                ],
                $tpl
            );
        }

        // Seed sample delivery audit logs
        $logs = [
            [
                'event' => 'order_placed',
                'channel' => 'email',
                'recipient' => 'sarah.connor@example.com',
                'subject' => 'Order Confirmation - #ORD-89421',
                'content' => 'Hi Sarah Connor, Thank you for your order! We have received order #ORD-89421 for a total of $249.99.',
                'status' => 'delivered',
                'sent_at' => now()->subHours(2),
            ],
            [
                'event' => 'order_shipped',
                'channel' => 'sms',
                'recipient' => '+15550192834',
                'subject' => null,
                'content' => 'Your Apex Commerce order #ORD-89421 has shipped via FedEx Express. Track package with TRK-99018247.',
                'status' => 'delivered',
                'sent_at' => now()->subHour(),
            ],
            [
                'event' => 'otp_verify',
                'channel' => 'sms',
                'recipient' => '+15550184729',
                'subject' => null,
                'content' => 'Your Apex Commerce security verification code is 784920.',
                'status' => 'delivered',
                'sent_at' => now()->subMinutes(15),
            ],
            [
                'event' => 'refund_processed',
                'channel' => 'email',
                'recipient' => 'baddomain@invalid-email-address',
                'subject' => 'Refund Processed for Order #ORD-77102',
                'content' => 'Dear Customer, A refund of $129.99 for order #ORD-77102 has been processed.',
                'status' => 'failed',
                'failure_reason' => '550 5.1.1 Requested action not taken: mailbox unavailable / domain unresolvable',
                'sent_at' => null,
            ],
        ];

        foreach ($logs as $log) {
            NotificationLog::create($log);
        }

        $this->command->info('Notification templates & logs seeded successfully!');
    }
}
