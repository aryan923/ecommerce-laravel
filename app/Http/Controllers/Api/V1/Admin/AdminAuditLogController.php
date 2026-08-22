<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\AuditLog;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAuditLogController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a paginated list of system audit logs with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => 'nullable|string|in:id,created_at,action,module',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        $query = AuditLog::query();

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('actor_name', 'like', "%{$search}%")
                  ->orWhere('actor_email', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('entity_id', 'like', "%{$search}%");
            });
        }

        // Module filter
        if ($request->filled('module')) {
            $query->where('module', strtolower($request->input('module')));
        }

        // Action filter
        if ($request->filled('action')) {
            $query->where('action', strtolower($request->input('action')));
        }

        // Actor ID filter
        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->input('actor_id'));
        }

        // Date range filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $perPage = (int) $request->input('per_page', 15);

        $logs = $query->orderBy($sortBy, $sortOrder)->paginate($perPage);

        // Executive Metrics Summary
        $metrics = [
            'total_logs' => AuditLog::count(),
            'today_events' => AuditLog::whereDate('created_at', now()->today())->count(),
            'active_actors' => AuditLog::distinct('actor_id')->count('actor_id'),
            'security_actions' => AuditLog::whereIn('module', ['staff', 'roles', 'settings', 'taxes'])->count(),
        ];

        return $this->successResponse([
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
            'metrics' => $metrics,
        ], 'Audit logs retrieved successfully.');
    }

    /**
     * Display detailed payload diff for a specific audit log record.
     */
    public function show(int|string $id): JsonResponse
    {
        $log = AuditLog::find($id);

        if (!$log) {
            return $this->errorResponse('Audit log record not found.', 404);
        }

        return $this->successResponse($log, 'Audit log detail retrieved successfully.');
    }

    /**
     * Export filtered audit logs as a downloadable CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = AuditLog::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('actor_name', 'like', "%{$search}%")
                  ->orWhere('actor_email', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('entity_id', 'like', "%{$search}%");
            });
        }

        if ($request->filled('module')) {
            $query->where('module', strtolower($request->input('module')));
        }

        if ($request->filled('action')) {
            $query->where('action', strtolower($request->input('action')));
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->input('actor_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $filename = 'audit_logs_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'ID',
                'Timestamp',
                'Actor Name',
                'Actor Email',
                'Module',
                'Action',
                'Entity Type',
                'Entity ID',
                'IP Address',
                'User Agent',
            ]);

            $query->orderBy('created_at', 'desc')->chunk(500, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id,
                        $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '',
                        $log->actor_name,
                        $log->actor_email,
                        $log->module,
                        $log->action,
                        $log->entity_type,
                        $log->entity_id,
                        $log->ip_address,
                        $log->user_agent,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Get list of modules, action codes, and active actors for UI filter dropdowns.
     */
    public function modules(): JsonResponse
    {
        $modules = AuditLog::distinct()->pluck('module')->filter()->values();
        $actions = AuditLog::distinct()->pluck('action')->filter()->values();
        $actors = AdminUser::select('id', 'name', 'email')->get();

        return $this->successResponse([
            'modules' => $modules,
            'actions' => $actions,
            'actors' => $actors,
        ], 'Audit log metadata retrieved successfully.');
    }
}
