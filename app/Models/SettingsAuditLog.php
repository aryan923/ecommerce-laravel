<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SettingsAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_user_id',
        'group',
        'action',
        'old_values',
        'new_values',
        'ip_address',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function adminUser()
    {
        return $this->belongsTo(AdminUser::class, 'admin_user_id');
    }
}
