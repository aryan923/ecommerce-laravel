<?php

namespace App\Http\Middleware;

use App\Models\AdminUser;
use App\Traits\ApiResponseTrait;
use Closure;
use Illuminate\Http\Request;

class CheckAdminPermission
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param string|null $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ?string $permission = null)
    {
        $user = $request->user();

        if (!$user || !($user instanceof AdminUser)) {
            return $this->errorResponse('Unauthenticated admin access.', 401);
        }

        if ($user->status !== 'active') {
            return $this->errorResponse('Your admin account is disabled or inactive.', 403);
        }

        if ($permission && !$user->hasPermission($permission)) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        return $next($request);
    }
}
