<?php

namespace App\Jobs;

use App\Models\ReportExport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public int $exportId;

    public function __construct(int $exportId)
    {
        $this->exportId = $exportId;
        $this->onQueue('reports');
    }

    public function handle(): void
    {
        Log::info("Executing GenerateReportJob for Export Record #{$this->exportId}");

        $export = ReportExport::find($this->exportId);
        if (!$export) {
            return;
        }

        $export->update([
            'status' => 'processing',
        ]);

        // Simulate async report generation
        $export->update([
            'status' => 'completed',
            'completed_at' => now(),
            'file_path' => "/exports/report_{$this->exportId}.csv",
        ]);
    }
}
