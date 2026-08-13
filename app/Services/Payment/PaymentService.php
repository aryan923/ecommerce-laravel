<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\Payment;
use App\Models\PaymentWebhook;
use App\Models\User;
use App\Services\Payment\Drivers\CodDriver;
use App\Services\Payment\Drivers\RazorpayDriver;
use App\Services\Payment\Drivers\StripeDriver;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    protected array $drivers = [];

    public function __construct(
        RazorpayDriver $razorpayDriver,
        StripeDriver $stripeDriver,
        CodDriver $codDriver
    ) {
        $this->drivers['razorpay'] = $razorpayDriver;
        $this->drivers['stripe'] = $stripeDriver;
        $this->drivers['cod'] = $codDriver;
    }

    /**
     * Get resolved driver instance.
     */
    public function getDriver(string $gateway): PaymentGatewayInterface
    {
        $gatewayKey = strtolower($gateway);

        if (!isset($this->drivers[$gatewayKey])) {
            throw ValidationException::withMessages([
                'payment_method' => ["Unsupported payment gateway [{$gateway}]."],
            ]);
        }

        return $this->drivers[$gatewayKey];
    }

    /**
     * List active payment methods with COD eligibility.
     */
    public function getAvailableMethods(?float $amount = null, ?string $postalCode = null): array
    {
        $maxCodAmount = (float) config('services.cod.max_amount', 10000.00);
        $codAvailable = true;
        $codReason = null;

        if ($amount !== null && $amount > $maxCodAmount) {
            $codAvailable = false;
            $codReason = "Order amount exceeds maximum COD limit of {$maxCodAmount}";
        }

        return [
            [
                'id' => 'razorpay',
                'name' => 'Razorpay (Cards, UPI, Netbanking, Wallets)',
                'type' => 'online',
                'available' => true,
            ],
            [
                'id' => 'stripe',
                'name' => 'Credit / Debit Card (Stripe)',
                'type' => 'online',
                'available' => true,
            ],
            [
                'id' => 'cod',
                'name' => 'Cash on Delivery',
                'type' => 'offline',
                'available' => $codAvailable,
                'max_limit' => $maxCodAmount,
                'reason' => $codReason,
            ],
        ];
    }

    /**
     * Initiate payment for an order.
     */
    public function initiatePayment(array $data, ?User $user = null): array
    {
        $orderId = $data['order_id'];
        $gatewayKey = strtolower($data['payment_method']);

        $order = Order::with('payments')->findOrFail($orderId);

        if ($order->status === 'paid' || $order->status === 'confirmed') {
            throw ValidationException::withMessages([
                'order' => ['Order has already been paid.'],
            ]);
        }

        $driver = $this->getDriver($gatewayKey);
        $initiationData = $driver->initiate($order, $data);

        // Find or create Payment record
        $payment = Payment::firstOrNew(['order_id' => $order->id]);
        $payment->gateway = $gatewayKey;
        $payment->payment_method = $gatewayKey;
        $payment->gateway_order_id = $initiationData['gateway_order_id'] ?? null;
        $payment->amount = $order->grand_total;
        $payment->currency = $order->currency ?? 'INR';
        $payment->status = $gatewayKey === 'cod' ? 'pending' : 'initiated';
        $payment->payload = $initiationData;
        $payment->save();

        if ($gatewayKey === 'cod') {
            $order->status = 'confirmed';
            $order->payment_method = 'cod';
            $order->save();

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $user?->id,
                'status' => 'confirmed',
                'comment' => 'Cash on Delivery order confirmed.',
            ]);
        }

        return array_merge($initiationData, [
            'payment_id' => $payment->id,
            'order_number' => $order->order_number,
        ]);
    }

    /**
     * Verify payment signature / callback.
     */
    public function verifyPayment(array $data): Payment
    {
        $orderId = $data['order_id'];
        $gatewayKey = strtolower($data['payment_method']);

        $order = Order::findOrFail($orderId);

        if ($order->status === 'paid') {
            return Payment::where('order_id', $order->id)->firstOrFail();
        }

        $payment = Payment::where('order_id', $order->id)->first();

        if (!$payment) {
            $payment = new Payment([
                'order_id' => $order->id,
                'gateway' => $gatewayKey,
                'payment_method' => $gatewayKey,
                'amount' => $order->grand_total,
                'currency' => $order->currency ?? 'INR',
                'status' => 'initiated',
            ]);
        }

        $driver = $this->getDriver($gatewayKey);
        $isValid = $driver->verify($payment, $data);

        if (!$isValid) {
            $payment->status = 'failed';
            $payment->failure_reason = 'Invalid payment signature';
            $payment->save();

            throw ValidationException::withMessages([
                'payment_signature' => ['Invalid payment signature.'],
            ]);
        }

        // Successful verification
        $transactionId = $data['razorpay_payment_id'] ?? ($data['payment_intent_id'] ?? 'TXN_' . time());

        $payment->status = 'captured';
        $payment->transaction_id = $transactionId;
        $payment->paid_at = now();
        $payment->payload = array_merge($payment->payload ?? [], $data);
        $payment->save();

        $order->status = 'paid';
        $order->save();

        OrderHistory::create([
            'order_id' => $order->id,
            'user_id' => auth('sanctum')->id(),
            'status' => 'paid',
            'comment' => "Payment captured via {$gatewayKey} (TXN: {$transactionId}).",
        ]);

        return $payment;
    }

    /**
     * Handle asynchronous webhook from payment gateway.
     */
    public function handleWebhook(string $gateway, array $payload, array $headers = []): PaymentWebhook
    {
        $driver = $this->getDriver($gateway);
        $result = $driver->handleWebhook($payload, $headers);

        $provider = $driver->getGatewayKey();
        $eventId = $result['event_id'];

        // Idempotency check: if event_id already processed, return existing record
        $existingWebhook = PaymentWebhook::where('provider', $provider)
            ->where('event_id', $eventId)
            ->first();

        if ($existingWebhook && $existingWebhook->processing_status === 'processed') {
            return $existingWebhook;
        }

        $webhook = $existingWebhook ?? new PaymentWebhook();
        $webhook->provider = $provider;
        $webhook->event_id = $eventId;
        $webhook->event_type = $result['event_type'];
        $webhook->payload = $payload;
        $webhook->processing_status = 'pending';
        $webhook->save();

        DB::transaction(function () use ($webhook, $result, $provider) {
            $gatewayOrderId = $result['gateway_order_id'];
            $transactionId = $result['transaction_id'];
            $status = $result['status'];

            $payment = null;
            if ($gatewayOrderId) {
                $payment = Payment::where('gateway_order_id', $gatewayOrderId)->first();
            }
            if (!$payment && $transactionId) {
                $payment = Payment::where('transaction_id', $transactionId)->first();
            }

            if ($payment && $status === 'captured') {
                $payment->status = 'captured';
                if ($transactionId) {
                    $payment->transaction_id = $transactionId;
                }
                $payment->paid_at = now();
                $payment->save();

                $order = $payment->order;
                if ($order && $order->status !== 'paid') {
                    $order->status = 'paid';
                    $order->save();

                    OrderHistory::create([
                        'order_id' => $order->id,
                        'user_id' => null,
                        'status' => 'paid',
                        'comment' => "Payment captured via {$provider} webhook ({$result['event_type']}).",
                    ]);
                }
            }

            $webhook->processing_status = 'processed';
            $webhook->processed_at = now();
            $webhook->save();
        });

        return $webhook;
    }

    /**
     * Mark payment as paid manually by Admin.
     */
    public function markAsPaidByAdmin(Payment $payment, string $transactionId, ?string $notes = null, $admin = null): Payment
    {
        $payment->status = 'captured';
        $payment->transaction_id = $transactionId;
        $payment->paid_at = now();
        $payment->save();

        $order = $payment->order;
        if ($order) {
            $order->status = 'paid';
            $order->save();

            OrderHistory::create([
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'status' => 'paid',
                'comment' => 'Payment manually marked as paid by Admin. ' . ($notes ? "Notes: {$notes}" : ''),
            ]);
        }

        return $payment;
    }
}
