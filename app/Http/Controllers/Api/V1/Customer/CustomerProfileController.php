<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\ChangePasswordRequest;
use App\Http\Requests\Customer\UpdateProfileRequest;
use App\Services\CustomerProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class CustomerProfileController extends BaseController
{
    public function __construct(
        protected CustomerProfileService $profileService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/customer/profile",
     *     summary="Get Customer Profile",
     *     description="Retrieve profile details of the logged-in customer.",
     *     operationId="customerGetProfile",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Customer profile retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load(['defaultShippingAddress', 'defaultBillingAddress']);
        return $this->successResponse($user, 'Customer profile retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/customer/profile",
     *     summary="Update Customer Profile",
     *     description="Update personal profile information of logged-in customer.",
     *     operationId="customerUpdateProfile",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="first_name", type="string"),
     *             @OA\Property(property="last_name", type="string"),
     *             @OA\Property(property="mobile", type="string"),
     *             @OA\Property(property="profile_image", type="string"),
     *             @OA\Property(property="date_of_birth", type="string", format="date"),
     *             @OA\Property(property="gender", type="string", enum={"male","female","other"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profile updated successfully"),
     *     @OA\Response(response=422, description="Validation failure")
     * )
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->profileService->updateProfile($request->user(), $request->validated());
        return $this->successResponse($user, 'Customer profile updated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customer/change-password",
     *     summary="Change Customer Password",
     *     description="Update account password for logged-in customer after verifying current password.",
     *     operationId="customerChangePassword",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password","password","password_confirmation"},
     *             @OA\Property(property="current_password", type="string"),
     *             @OA\Property(property="password", type="string", minimum=8),
     *             @OA\Property(property="password_confirmation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Password changed successfully"),
     *     @OA\Response(response=422, description="Incorrect current password or validation failure")
     * )
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->profileService->changePassword(
            $request->user(),
            $request->input('current_password'),
            $request->input('password')
        );

        return $this->successResponse(null, 'Password changed successfully.');
    }
}
