<?php

namespace App\Exceptions;

use App\Traits\ApiResponseTrait;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponseTrait;

    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return $this->handleApiException($e);
            }
        });
    }

    /**
     * Handle exceptions for API requests and format as standard JSON.
     *
     * @param Throwable $e
     * @return \Illuminate\Http\JsonResponse
     */
    protected function handleApiException(Throwable $e): \Illuminate\Http\JsonResponse
    {
        if ($e instanceof ValidationException) {
            return $this->validationErrorResponse(
                $e->errors(),
                'Validation failed'
            );
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return $this->errorResponse(
                'Resource or endpoint not found',
                404
            );
        }

        if ($e instanceof AuthenticationException) {
            return $this->errorResponse(
                'Unauthenticated',
                401
            );
        }

        if ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
            return $this->errorResponse(
                'Unauthorized access',
                403
            );
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            return $this->errorResponse(
                'Method not allowed',
                405
            );
        }

        $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
        $message = config('app.debug') ? $e->getMessage() : 'Internal server error';
        $errors = config('app.debug') ? [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ] : null;

        return $this->errorResponse($message ?: 'Internal server error', $statusCode, $errors);
    }
}
