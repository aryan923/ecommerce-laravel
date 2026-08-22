<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSmsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public string $mobile;
    public string $message;

    public function __construct(string $mobile, string $message)
    {
        $this->mobile = $mobile;
        $this->message = $message;
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        Log::info("Executing SendSmsJob for {$this->mobile}");
    }
}
