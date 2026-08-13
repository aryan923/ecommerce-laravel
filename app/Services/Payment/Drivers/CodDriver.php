<?php

namespace App\Services\Payment\Drivers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Validation\ValidationException;

class CodDriver implements PaymentGatewayInterface
{
    protected float $maxCodAmount;

    public function __construct()
    {
        $this->maxCodAmount = (float) config('services.cod.max_amount', 10000.00);
    }

    public function getGatewayKey(): string
    {
        return 'cod';
    }

    public function initiate(Order $order, array $params = []): array
    {
        if ((float) $order->grand_total > $this->maxCodAmount) {
            throw ValidationException::withMessages([
                'payment_method' => ['Order amount exceeds maximum allowed limit for Cash on Delivery.'],
            ]);
        }

        $gatewayOrderId = 'cod_' . $order->order_number;

        return [
            'gateway' => $this->getGatewayKey(),
            'gateway_order_id' => $gatewayOrderId,
            'amount' => (float) $order->grand_total,
            'currency' => $order->currency ?? 'INR',
            'status' => 'pending',
            'message' => 'Cash on Delivery order placed successfully. Payment due upon delivery.',
        ];
    }

    public function verify(Payment $payment, array $params = []): bool
    {
        // COD order payments remain pending until manual admin/delivery settlement
        return true;
    }

    public function handleWebhook(array $payload, array $headers = []): array
    {
        return [
            'event_id' => 'cod_none',
            'event_type' => 'cod.ignored',
            'transaction_id' => null,
            'gateway_order_id' => null,
            'status' => 'ignored',
            'payload' => $payload,
            'signature_valid' => true,
        ];
    }
}
