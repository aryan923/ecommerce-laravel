<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class AdminFailedJobController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a paginated list of failed queue jobs with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('failed_jobs');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('queue', 'like', "%{$search}%")
                  ->orWhere('payload', 'like', "%{$search}%")
                  ->orWhere('exception', 'like', "%{$search}%");
            });
        }

        if ($request->filled('queue')) {
            $query->where('queue', $request->input('queue'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('failed_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('failed_at', '<=', $request->input('date_to'));
        }

        $perPage = (int) $request->input('per_page', 15);
        $logs = $query->orderBy('failed_at', 'desc')->paginate($perPage);

        // Parse JSON payload on items for client UI
        $items = collect($logs->items())->map(function ($job) {
            $payload = json_decode($job->payload, true) ?? [];
            $displayName = $payload['displayName'] ?? ($payload['job'] ?? 'Unknown Job');

            return [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'connection' => $job->connection,
                'queue' => $job->queue,
                'job_name' => $displayName,
                'failed_at' => $job->failed_at,
                'exception_snippet' => substr($job->exception, 0, 200) . '...',
            ];
        });

        $metrics = [
            'total_failed' => DB::table('failed_jobs')->count(),
            'queues_impacted' => DB::table('failed_jobs')->distinct('queue')->count('queue'),
        ];

        return $this->successResponse([
            'failed_jobs' => $items,
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'metrics' => $metrics,
        ], 'Failed jobs retrieved successfully.');
    }

    /**
     * Display single failed job details with full stack trace and payload.
     */
    public function show(int|string $id): JsonResponse
    {
        $job = DB::table('failed_jobs')->where('id', $id)->orWhere('uuid', $id)->first();

        if (!$job) {
            return $this->errorResponse('Failed job record not found.', 404);
        }

        $payload = json_decode($job->payload, true) ?? [];

        return $this->successResponse([
            'id' => $job->id,
            'uuid' => $job->uuid,
            'connection' => $job->connection,
            'queue' => $job->queue,
            'payload' => $payload,
            'exception' => $job->exception,
            'failed_at' => $job->failed_at,
        ], 'Failed job detail retrieved successfully.');
    }

    /**
     * Retry a specific failed queue job.
     */
    public function retry(int|string $id): JsonResponse
    {
        $job = DB::table('failed_jobs')->where('id', $id)->orWhere('uuid', $id)->first();

        if (!$job) {
            return $this->errorResponse('Failed job record not found.', 404);
        }

        Artisan::call('queue:retry', ['id' => [$job->uuid]]);

        return $this->successResponse(null, "Failed job #{$id} queued for retry.");
    }

    /**
     * Bulk retry selected failed jobs.
     */
    public function bulkRetry(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required',
        ]);

        $ids = $request->input('ids');
        $uuids = DB::table('failed_jobs')->whereIn('id', $ids)->orWhereIn('uuid', $ids)->pluck('uuid')->toArray();

        if (!empty($uuids)) {
            Artisan::call('queue:retry', ['id' => $uuids]);
        }

        return $this->successResponse(null, count($uuids) . ' failed jobs queued for retry.');
    }

    /**
     * Delete a failed job record.
     */
    public function destroy(int|string $id): JsonResponse
    {
        $job = DB::table('failed_jobs')->where('id', $id)->orWhere('uuid', $id)->first();

        if (!$job) {
            return $this->errorResponse('Failed job record not found.', 404);
        }

        DB::table('failed_jobs')->where('id', $job->id)->delete();

        return $this->successResponse(null, 'Failed job record deleted successfully.');
    }

    /**
     * Flush all failed jobs from queue.
     */
    public function flush(): JsonResponse
    {
        Artisan::call('queue:flush');

        return $this->successResponse(null, 'All failed job records flushed successfully.');
    }
}
