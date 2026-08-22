<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuditLogService
{
    /**
     * Record an audit log entry.
     *
     * @param string $module High level module name e.g. 'staff', 'roles', 'settings', 'taxes', 'products', 'orders'
     * @param string $action Dot-notation action code e.g. 'admin.create', 'role.update', 'tax.update'
     * @param string|null $entityType Model class name or target string
     * @param string|int|null $entityId Target entity ID
     * @param array|null $oldValues Array of previous state values
     * @param array|null $newValues Array of updated state values
     * @param array|null $customActor Manual actor override ['id' => 1, 'name' => 'Name', 'email' => 'Email']
     */
    public static function log(
        string $module,
        string $action,
        ?string $entityType = null,
        string|int|null $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $customActor = null
    ): ?AuditLog {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();

            $actorId = $customActor['id'] ?? $user?->id ?? null;
            $actorName = $customActor['name'] ?? $user?->name ?? 'System / Automated Job';
            $actorEmail = $customActor['email'] ?? $user?->email ?? 'system@internal';

            return AuditLog::create([
                'actor_id' => $actorId,
                'actor_name' => $actorName,
                'actor_email' => $actorEmail,
                'module' => strtolower($module),
                'action' => strtolower($action),
                'entity_type' => $entityType,
                'entity_id' => $entityId !== null ? (string)$entityId : null,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => Request::ip() ?? '127.0.0.1',
                'user_agent' => Request::userAgent() ?? 'CLI / Service',
            ]);
        } catch (Throwable $e) {
            Log::error('Failed to create audit log record: ' . $e->getMessage(), [
                'module' => $module,
                'action' => $action,
                'exception' => $e,
            ]);
            return null;
        }
    }
}
