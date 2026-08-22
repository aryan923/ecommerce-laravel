<?php

namespace App\Jobs;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncShippingStatusJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public ?int $shipmentId;

    public function __construct(?int $shipmentId = null)
    {
        $this->shipmentId = $shipmentId;
        $this->onQueue('default');
    }

    public function handle(): void
    {
        Log::info("Executing SyncShippingStatusJob for Shipment ID: " . ($this->shipmentId ?? 'All Active'));

        $query = Shipment::query()->whereIn('status', ['pending', 'manifested', 'in_transit', 'out_for_delivery']);

        if ($this->shipmentId) {
            $query->where('id', $this->shipmentId);
        }

        $shipments = $query->get();

        foreach ($shipments as $shipment) {
            Log::info("Syncing carrier tracking status for shipment #{$shipment->id} ({$shipment->tracking_number})");
        }
    }
}
