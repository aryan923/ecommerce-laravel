<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'email',
        'mobile',
        'password',
        'profile_image',
        'date_of_birth',
        'gender',
        'status',
        'role',
        'terms_accepted',
        'admin_notes',
        'email_verified_at',
        'mobile_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'mobile_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'terms_accepted' => 'boolean',
        'password' => 'hashed',
    ];

    /**
     * Check if user account is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}") ?: ($this->name ?? '');
    }

    /**
     * Relationship to customer addresses.
     */
    public function addresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Address::class, 'user_id');
    }

    /**
     * Relationship to default shipping address.
     */
    public function defaultShippingAddress(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Address::class, 'user_id')->where('is_default_shipping', true);
    }

    /**
     * Relationship to default billing address.
     */
    public function defaultBillingAddress(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Address::class, 'user_id')->where('is_default_billing', true);
    }

    /**
     * Relationship to Orders.
     */
    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Relationship to Wishlist.
     */
    public function wishlistItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Wishlist::class, 'user_id');
    }

    /**
     * Relationship to active customer cart.
     */
    public function cart(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Cart::class, 'user_id');
    }

    /**
     * Relationship to coupon usages.
     */
    public function couponUsages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CouponUsage::class, 'user_id');
    }

    /**
     * Relationship to product reviews submitted by customer.
     */
    public function reviews(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    /**
     * Relationship to return requests submitted by customer.
     */
    public function returnRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReturnRequest::class, 'user_id');
    }

    /**
     * Relationship to customer saved bank accounts.
     */
    public function bankAccounts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CustomerBankAccount::class, 'user_id');
    }

    /**
     * Relationship to refunds associated with customer orders.
     */
    public function refunds(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Refund::class, Order::class, 'user_id', 'order_id');
    }
}
