<?php

namespace App\Services;

use App\Jobs\SendNotificationJob;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class NotificationService
{
    /**
     * Dispatch notification to target channels.
     */
    public function dispatch(string $event, string $recipient, array $data, ?User $user = null, array $channels = ['email']): array
    {
        $logs = [];

        foreach ($channels as $channel) {
            $template = NotificationTemplate::where('event', $event)
                ->where('channel', $channel)
                ->where('status', true)
                ->first();

            $subject = null;
            $content = "";

            if ($template) {
                $subject = $this->interpolateVariables($template->subject ?? '', $data);
                $content = $this->interpolateVariables($template->body, $data);
            } else {
                $subject = "Notification: " . ucfirst(str_replace('_', ' ', $event));
                $content = "Event {$event} occurred for recipient {$recipient}. Data: " . json_encode($data);
            }

            $log = NotificationLog::create([
                'event' => $event,
                'channel' => $channel,
                'recipient' => $recipient,
                'user_id' => $user?->id,
                'subject' => $subject,
                'content' => $content,
                'status' => 'queued',
            ]);

            // Execute delivery inline or queue job
            if (config('queue.default') === 'sync') {
                $this->executeChannelDelivery($log);
            } else {
                SendNotificationJob::dispatch($log->id);
            }

            $logs[] = $log->fresh();
        }

        return $logs;
    }

    /**
     * Execute delivery for a notification log record.
     */
    public function executeChannelDelivery(NotificationLog $log): bool
    {
        try {
            // Simulated delivery logic per channel
            $log->status = 'sent';
            $log->sent_at = now();
            $log->save();

            return true;
        } catch (\Throwable $e) {
            $log->status = 'failed';
            $log->failure_reason = $e->getMessage();
            $log->save();

            return false;
        }
    }

    /**
     * Interpolate {{variable_name}} syntax with data array values.
     */
    protected function interpolateVariables(?string $text, array $data): string
    {
        if (empty($text)) {
            return '';
        }

        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function ($matches) use ($data) {
            $key = $matches[1];
            return isset($data[$key]) ? (string) $data[$key] : $matches[0];
        }, $text);
    }

    /**
     * Admin list notification templates.
     */
    public function listTemplates(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = NotificationTemplate::query();

        if (!empty($filters['event'])) {
            $query->where('event', $filters['event']);
        }

        if (!empty($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Admin create template.
     *
     * @throws ValidationException
     */
    public function createTemplate(array $data): NotificationTemplate
    {
        $exists = NotificationTemplate::where('event', $data['event'])
            ->where('channel', $data['channel'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'channel' => ["A template for event '{$data['event']}' on channel '{$data['channel']}' already exists."],
            ]);
        }

        return NotificationTemplate::create([
            'event' => $data['event'],
            'channel' => $data['channel'],
            'subject' => $data['subject'] ?? null,
            'body' => $data['body'],
            'variables' => $data['variables'] ?? [],
            'status' => $data['status'] ?? true,
        ]);
    }

    /**
     * Admin update template.
     */
    public function updateTemplate(int $id, array $data): NotificationTemplate
    {
        $template = NotificationTemplate::findOrFail($id);

        $template->update([
            'subject' => $data['subject'] ?? $template->subject,
            'body' => $data['body'] ?? $template->body,
            'variables' => $data['variables'] ?? $template->variables,
            'status' => isset($data['status']) ? (bool) $data['status'] : $template->status,
        ]);

        return $template;
    }

    /**
     * Admin list notification delivery logs.
     */
    public function listLogs(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = NotificationLog::with('user');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('recipient', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Customer get in-app notifications.
     */
    public function getCustomerInAppNotifications(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return NotificationLog::where('user_id', $user->id)
            ->where('channel', 'in_app')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    /**
     * Customer mark in-app notification as read.
     *
     * @throws ModelNotFoundException
     */
    public function markAsRead(User $user, int $notificationId): NotificationLog
    {
        $log = NotificationLog::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->where('channel', 'in_app')
            ->firstOrFail();

        $log->read_at = now();
        $log->save();

        return $log;
    }
}
