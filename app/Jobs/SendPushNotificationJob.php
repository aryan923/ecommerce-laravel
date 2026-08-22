<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public int $userId;
    public string $title;
    public string $body;
    public array $extraData;

    public function __construct(int $userId, string $title, string $body, array $extraData = [])
    {
        $this->userId = $userId;
        $this->title = $title;
        $this->body = $body;
        $this->extraData = $extraData;
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        Log::info("Executing SendPushNotificationJob for User #{$this->userId}: {$this->title}");
    }
}
