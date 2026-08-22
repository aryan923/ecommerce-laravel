<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExportDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public string $exportType;
    public array $filters;
    public int $adminUserId;

    public function __construct(string $exportType, array $filters = [], int $adminUserId = 1)
    {
        $this->exportType = $exportType;
        $this->filters = $filters;
        $this->adminUserId = $adminUserId;
        $this->onQueue('reports');
    }

    public function handle(): void
    {
        Log::info("Executing ExportDataJob for type: {$this->exportType} requested by Admin #{$this->adminUserId}");
    }
}
