<?php

namespace App\Services;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerProfileService
{
    /**
     * Update customer profile.
     *
     * @param User $user
     * @param array $data
     * @return User
     */
    public function updateProfile(User $user, array $data): User
    {
        $updateData = array_filter([
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'mobile' => $data['mobile'] ?? null,
            'profile_image' => $data['profile_image'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
        ], fn ($val) => $val !== null);

        if (isset($data['first_name']) || isset($data['last_name'])) {
            $firstName = $data['first_name'] ?? $user->first_name;
            $lastName = $data['last_name'] ?? $user->last_name;
            $updateData['name'] = trim("{$firstName} {$lastName}");
        }

        $user->update($updateData);

        return $user->fresh();
    }

    /**
     * Change customer password.
     *
     * @param User $user
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool
     * @throws ValidationException
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided current password is incorrect.'],
            ]);
        }

        return $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }

    /**
     * Get all saved addresses for a customer.
     *
     * @param int $userId
     * @return Collection
     */
    public function listAddresses(int $userId): Collection
    {
        return Address::where('user_id', $userId)
            ->orderBy('is_default_shipping', 'desc')
            ->orderBy('is_default_billing', 'desc')
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Get single address owned by customer.
     *
     * @param int $userId
     * @param int $addressId
     * @return Address
     */
    public function getAddress(int $userId, int $addressId): Address
    {
        return Address::where('user_id', $userId)->where('id', $addressId)->firstOrFail();
    }

    /**
     * Create a new address for customer.
     *
     * @param int $userId
     * @param array $data
     * @return Address
     */
    public function createAddress(int $userId, array $data): Address
    {
        $existingCount = Address::where('user_id', $userId)->count();

        $isDefaultShipping = isset($data['is_default_shipping'])
            ? (bool) $data['is_default_shipping']
            : ($existingCount === 0);

        $isDefaultBilling = isset($data['is_default_billing'])
            ? (bool) $data['is_default_billing']
            : ($existingCount === 0);

        if ($isDefaultShipping) {
            Address::where('user_id', $userId)->update(['is_default_shipping' => false]);
        }

        if ($isDefaultBilling) {
            Address::where('user_id', $userId)->update(['is_default_billing' => false]);
        }

        return Address::create([
            'user_id' => $userId,
            'name' => $data['name'],
            'mobile' => $data['mobile'],
            'line_1' => $data['line_1'],
            'line_2' => $data['line_2'] ?? null,
            'landmark' => $data['landmark'] ?? null,
            'city' => $data['city'],
            'state' => $data['state'],
            'country' => $data['country'] ?? 'India',
            'postal_code' => $data['postal_code'],
            'type' => $data['type'] ?? 'home',
            'is_default_shipping' => $isDefaultShipping,
            'is_default_billing' => $isDefaultBilling,
        ]);
    }

    /**
     * Update saved address owned by customer.
     *
     * @param int $userId
     * @param int $addressId
     * @param array $data
     * @return Address
     */
    public function updateAddress(int $userId, int $addressId, array $data): Address
    {
        $address = $this->getAddress($userId, $addressId);

        if (isset($data['is_default_shipping']) && (bool) $data['is_default_shipping']) {
            Address::where('user_id', $userId)
                ->where('id', '!=', $addressId)
                ->update(['is_default_shipping' => false]);
        }

        if (isset($data['is_default_billing']) && (bool) $data['is_default_billing']) {
            Address::where('user_id', $userId)
                ->where('id', '!=', $addressId)
                ->update(['is_default_billing' => false]);
        }

        $address->update(array_filter([
            'name' => $data['name'] ?? $address->name,
            'mobile' => $data['mobile'] ?? $address->mobile,
            'line_1' => $data['line_1'] ?? $address->line_1,
            'line_2' => array_key_exists('line_2', $data) ? $data['line_2'] : $address->line_2,
            'landmark' => array_key_exists('landmark', $data) ? $data['landmark'] : $address->landmark,
            'city' => $data['city'] ?? $address->city,
            'state' => $data['state'] ?? $address->state,
            'country' => $data['country'] ?? $address->country,
            'postal_code' => $data['postal_code'] ?? $address->postal_code,
            'type' => $data['type'] ?? $address->type,
            'is_default_shipping' => isset($data['is_default_shipping']) ? (bool) $data['is_default_shipping'] : $address->is_default_shipping,
            'is_default_billing' => isset($data['is_default_billing']) ? (bool) $data['is_default_billing'] : $address->is_default_billing,
        ], fn ($val) => $val !== null));

        return $address->fresh();
    }

    /**
     * Delete saved address owned by customer.
     *
     * @param int $userId
     * @param int $addressId
     * @return bool
     */
    public function deleteAddress(int $userId, int $addressId): bool
    {
        $address = $this->getAddress($userId, $addressId);
        return (bool) $address->delete();
    }

    /**
     * Mark address as default shipping.
     *
     * @param int $userId
     * @param int $addressId
     * @return Address
     */
    public function setDefaultShipping(int $userId, int $addressId): Address
    {
        $address = $this->getAddress($userId, $addressId);

        Address::where('user_id', $userId)->update(['is_default_shipping' => false]);
        $address->update(['is_default_shipping' => true]);

        return $address->fresh();
    }

    /**
     * Mark address as default billing.
     *
     * @param int $userId
     * @param int $addressId
     * @return Address
     */
    public function setDefaultBilling(int $userId, int $addressId): Address
    {
        $address = $this->getAddress($userId, $addressId);

        Address::where('user_id', $userId)->update(['is_default_billing' => false]);
        $address->update(['is_default_billing' => true]);

        return $address->fresh();
    }
}
