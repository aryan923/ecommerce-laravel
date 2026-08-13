<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Payment;

interface PaymentGatewayInterface
{
    /**
     * Get gateway driver identifier key.
     */
    public function getGatewayKey(): string;

    /**
     * Initiate payment for an order with the gateway.
     *
     * @param Order $order
     * @param array $params
     * @return array Response payload containing initialization token/data
     */
    public function initiate(Order $order, array $params = []): array;

    /**
     * Verify payment signature or authorization payload.
     *
     * @param Payment $payment
     * @param array $params
     * @return bool
     */
    public function verify(Payment $payment, array $params = []): bool;

    /**
     * Handle asynchronous webhook payload from gateway.
     *
     * @param array $payload
     * @param array $headers
     * @return array Standardized webhook evaluation result ['event_id', 'event_type', 'payment_id', 'gateway_order_id', 'status', 'payload']
     */
    public function handleWebhook(array $payload, array $headers = []): array;
}
