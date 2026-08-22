<?php

namespace App\Jobs;

use App\Models\Inventory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendLowStockAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public function __construct()
    {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        Log::info("Executing SendLowStockAlertJob...");

        $lowStockItems = Inventory::with('product')
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->get();

        if ($lowStockItems->isNotEmpty()) {
            Log::info("Found {$lowStockItems->count()} low stock inventory records requiring alert digest.");
        }
    }
}
