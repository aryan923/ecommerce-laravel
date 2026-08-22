<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPaymentReconciliationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [15, 60, 180];

    public ?string $date;

    public function __construct(?string $date = null)
    {
        $this->date = $date ?? date('Y-m-d');
        $this->onQueue('high');
    }

    public function handle(): void
    {
        Log::info("Executing ProcessPaymentReconciliationJob for date: {$this->date}");

        $pendingPayments = Payment::where('status', 'pending')
            ->whereDate('created_at', '<=', $this->date)
            ->get();

        foreach ($pendingPayments as $payment) {
            // Reconcile pending payment state
            Log::info("Reconciling payment #{$payment->id} transaction {$payment->transaction_id}");
        }
    }
}
