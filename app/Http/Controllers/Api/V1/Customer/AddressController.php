<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\AddressRequest;
use App\Services\CustomerProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class AddressController extends BaseController
{
    public function __construct(
        protected CustomerProfileService $profileService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/customer/addresses",
     *     summary="List Saved Addresses",
     *     description="Retrieve all saved delivery and billing addresses for the logged-in customer.",
     *     operationId="customerListAddresses",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Saved addresses retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $addresses = $this->profileService->listAddresses($request->user()->id);
        return $this->successResponse($addresses, 'Saved addresses retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customer/addresses",
     *     summary="Create Saved Address",
     *     description="Add a new address to customer address book.",
     *     operationId="customerCreateAddress",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","mobile","line_1","city","state","country","postal_code"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="mobile", type="string"),
     *             @OA\Property(property="line_1", type="string"),
     *             @OA\Property(property="line_2", type="string"),
     *             @OA\Property(property="landmark", type="string"),
     *             @OA\Property(property="city", type="string"),
     *             @OA\Property(property="state", type="string"),
     *             @OA\Property(property="country", type="string", default="India"),
     *             @OA\Property(property="postal_code", type="string"),
     *             @OA\Property(property="type", type="string", enum={"home","office","other"}),
     *             @OA\Property(property="is_default_shipping", type="boolean"),
     *             @OA\Property(property="is_default_billing", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Address created successfully"),
     *     @OA\Response(response=422, description="Validation failure")
     * )
     */
    public function store(AddressRequest $request): JsonResponse
    {
        $address = $this->profileService->createAddress($request->user()->id, $request->validated());
        return $this->successResponse($address, 'Address created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/addresses/{id}",
     *     summary="Get Address Detail",
     *     description="Fetch details of a single saved address by ID.",
     *     operationId="customerGetAddressDetail",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Address detail retrieved successfully"),
     *     @OA\Response(response=404, description="Address not found")
     * )
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $address = $this->profileService->getAddress($request->user()->id, $id);
        return $this->successResponse($address, 'Address detail retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/customer/addresses/{id}",
     *     summary="Update Saved Address",
     *     description="Update details of an existing saved address.",
     *     operationId="customerUpdateAddress",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="mobile", type="string"),
     *             @OA\Property(property="line_1", type="string"),
     *             @OA\Property(property="line_2", type="string"),
     *             @OA\Property(property="landmark", type="string"),
     *             @OA\Property(property="city", type="string"),
     *             @OA\Property(property="state", type="string"),
     *             @OA\Property(property="country", type="string"),
     *             @OA\Property(property="postal_code", type="string"),
     *             @OA\Property(property="type", type="string", enum={"home","office","other"}),
     *             @OA\Property(property="is_default_shipping", type="boolean"),
     *             @OA\Property(property="is_default_billing", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Address updated successfully"),
     *     @OA\Response(response=404, description="Address not found")
     * )
     */
    public function update(int $id, AddressRequest $request): JsonResponse
    {
        $address = $this->profileService->updateAddress($request->user()->id, $id, $request->validated());
        return $this->successResponse($address, 'Address updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/customer/addresses/{id}",
     *     summary="Delete Saved Address",
     *     description="Remove a saved address from customer address book.",
     *     operationId="customerDeleteAddress",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Address deleted successfully"),
     *     @OA\Response(response=404, description="Address not found")
     * )
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $this->profileService->deleteAddress($request->user()->id, $id);
        return $this->successResponse(null, 'Address deleted successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/customer/addresses/{id}/default-shipping",
     *     summary="Mark Address as Default Shipping",
     *     description="Designate target address as default shipping address.",
     *     operationId="customerSetDefaultShippingAddress",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Default shipping address updated successfully")
     * )
     */
    public function setDefaultShipping(int $id, Request $request): JsonResponse
    {
        $address = $this->profileService->setDefaultShipping($request->user()->id, $id);
        return $this->successResponse($address, 'Default shipping address updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/customer/addresses/{id}/default-billing",
     *     summary="Mark Address as Default Billing",
     *     description="Designate target address as default billing address.",
     *     operationId="customerSetDefaultBillingAddress",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Default billing address updated successfully")
     * )
     */
    public function setDefaultBilling(int $id, Request $request): JsonResponse
    {
        $address = $this->profileService->setDefaultBilling($request->user()->id, $id);
        return $this->successResponse($address, 'Default billing address updated successfully.');
    }
}
