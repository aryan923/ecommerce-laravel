<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class AuthController extends BaseController
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     summary="Customer Registration",
     *     description="Register a new customer account and return a Sanctum Bearer Token.",
     *     operationId="registerCustomer",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"first_name","last_name","email","password","password_confirmation","terms_accepted"},
     *             @OA\Property(property="first_name", type="string", example="John"),
     *             @OA\Property(property="last_name", type="string", example="Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="mobile", type="string", example="+1234567890"),
     *             @OA\Property(property="password", type="string", format="password", example="SecretPassword123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="SecretPassword123!"),
     *             @OA\Property(property="terms_accepted", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Customer registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User registered successfully."),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return $this->successResponse($result, 'User registered successfully.', 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     summary="Customer Dual-Identifier Login",
     *     description="Login using email or mobile number with password.",
     *     operationId="loginCustomer",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"login","password"},
     *             @OA\Property(property="login", type="string", example="john.doe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="SecretPassword123!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful."),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Invalid credentials"),
     *     @OA\Response(response=403, description="Account suspended or inactive")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->input('login'),
            $request->input('password')
        );

        return $this->successResponse($result, 'Login successful.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/auth/me",
     *     summary="Get Authenticated Customer Profile",
     *     description="Retrieve current customer profile using Sanctum Bearer Token.",
     *     operationId="getCustomerProfile",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Profile retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User profile retrieved successfully."),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        return $this->successResponse([
            'user' => $request->user(),
        ], 'User profile retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     summary="Customer Logout",
     *     description="Revoke current Sanctum token or all tokens.",
     *     operationId="logoutCustomer",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="logout_all", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Logged out successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out successfully."),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(
            $request->user(),
            (bool) $request->input('logout_all', false)
        );

        return $this->successResponse(null, 'Logged out successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/forgot-password",
     *     summary="Request Password Reset OTP",
     *     description="Send 6-digit OTP code to user email or mobile.",
     *     operationId="forgotPassword",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"identifier"},
     *             @OA\Property(property="identifier", type="string", example="john.doe@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OTP request received",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="If the account exists, a password reset code has been sent."),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     )
     * )
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->input('identifier'));

        return $this->successResponse(null, 'If the account exists, a password reset code has been sent.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/reset-password",
     *     summary="Reset Password with OTP",
     *     description="Reset customer password using 6-digit OTP code.",
     *     operationId="resetPassword",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"identifier","otp_code","password","password_confirmation"},
     *             @OA\Property(property="identifier", type="string", example="john.doe@example.com"),
     *             @OA\Property(property="otp_code", type="string", example="123456"),
     *             @OA\Property(property="password", type="string", format="password", example="NewSecretPassword123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="NewSecretPassword123!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password reset successfully."),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid or expired OTP code")
     * )
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword(
            $request->input('identifier'),
            $request->input('otp_code'),
            $request->input('password')
        );

        return $this->successResponse(null, 'Password reset successfully.');
    }
}
