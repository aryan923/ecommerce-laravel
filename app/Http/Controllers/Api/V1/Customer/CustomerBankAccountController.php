<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\CustomerBankAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Annotations as OA;

class CustomerBankAccountController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/customer/bank-accounts",
     *     summary="List Customer Saved Bank Accounts",
     *     description="Retrieve all saved bank accounts belonging to the authenticated customer.",
     *     operationId="customerListBankAccounts",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Bank accounts list retrieved successfully"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $accounts = CustomerBankAccount::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return $this->successResponse($accounts, 'Saved bank accounts retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customer/bank-accounts",
     *     summary="Add Saved Bank Account",
     *     description="Store a new customer bank account for refund payouts.",
     *     operationId="customerStoreBankAccount",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"account_holder_name", "bank_name", "account_number", "ifsc_code"},
     *             @OA\Property(property="account_holder_name", type="string", example="John Doe"),
     *             @OA\Property(property="bank_name", type="string", example="HDFC Bank"),
     *             @OA\Property(property="account_number", type="string", example="50100234567890"),
     *             @OA\Property(property="ifsc_code", type="string", example="HDFC0001234"),
     *             @OA\Property(property="account_type", type="string", enum={"savings", "current"}, example="savings"),
     *             @OA\Property(property="upi_id", type="string", example="johndoe@okhdfcbank"),
     *             @OA\Property(property="is_default", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Bank account saved successfully"),
     *     @OA\Response(response=422, description="Validation failure")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_holder_name' => 'required|string|max:150',
            'bank_name' => 'required|string|max:150',
            'account_number' => 'required|string|min:6|max:50',
            'ifsc_code' => 'required|string|max:20',
            'account_type' => 'nullable|string|in:savings,current',
            'upi_id' => 'nullable|string|max:100',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $isDefault = (bool) ($validated['is_default'] ?? false);

        // If this is the user's first bank account, automatically make it default
        if (!CustomerBankAccount::where('user_id', $user->id)->exists()) {
            $isDefault = true;
        }

        $bankAccount = DB::transaction(function () use ($user, $validated, $isDefault) {
            if ($isDefault) {
                CustomerBankAccount::where('user_id', $user->id)->update(['is_default' => false]);
            }

            return CustomerBankAccount::create([
                'user_id' => $user->id,
                'account_holder_name' => $validated['account_holder_name'],
                'bank_name' => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'ifsc_code' => strtoupper($validated['ifsc_code']),
                'account_type' => $validated['account_type'] ?? 'savings',
                'upi_id' => $validated['upi_id'] ?? null,
                'is_default' => $isDefault,
                'is_verified' => false,
            ]);
        });

        return $this->successResponse($bankAccount, 'Bank account saved successfully.', 201);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/customer/bank-accounts/{id}/default",
     *     summary="Set Default Bank Account",
     *     description="Designate a saved bank account as the default payout destination.",
     *     operationId="customerSetDefaultBankAccount",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Default bank account set successfully")
     * )
     */
    public function setDefault(int $id, Request $request): JsonResponse
    {
        $user = $request->user();
        $account = CustomerBankAccount::where('user_id', $user->id)->findOrFail($id);

        DB::transaction(function () use ($user, $account) {
            CustomerBankAccount::where('user_id', $user->id)->update(['is_default' => false]);
            $account->is_default = true;
            $account->save();
        });

        return $this->successResponse($account->fresh(), 'Default bank account updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/customer/bank-accounts/{id}",
     *     summary="Delete Saved Bank Account",
     *     description="Remove a saved bank account from the customer's profile.",
     *     operationId="customerDeleteBankAccount",
     *     tags={"Customer Profile & Addresses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Bank account deleted successfully")
     * )
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $user = $request->user();
        $account = CustomerBankAccount::where('user_id', $user->id)->findOrFail($id);
        $account->delete();

        return $this->successResponse(null, 'Bank account deleted successfully.');
    }
}
