<?php

namespace App\Jobs;

use App\Models\NotificationLog;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $logId;

    public function __construct(int $logId)
    {
        $this->logId = $logId;
    }

    public function handle(NotificationService $notificationService): void
    {
        $log = NotificationLog::find($this->logId);
        if ($log && $log->status === 'queued') {
            $notificationService->executeChannelDelivery($log);
        }
    }
}
