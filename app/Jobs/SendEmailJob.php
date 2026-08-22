<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [10, 30, 60];

    public string $to;
    public string $subject;
    public string $body;
    public array $data;

    public function __construct(string $to, string $subject, string $body, array $data = [])
    {
        $this->to = $to;
        $this->subject = $subject;
        $this->body = $body;
        $this->data = $data;
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        Log::info("Executing SendEmailJob for {$this->to} - Subject: {$this->subject}");
        
        // Transactional mail send
        Mail::raw($this->body, function ($message) {
            $message->to($this->to)
                    ->subject($this->subject);
        });
    }
}
