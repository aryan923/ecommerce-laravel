<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'pricing_mode',
        'default_tax_class_id',
        'store_gstin',
        'store_state_code',
        'shipping_tax_mode',
        'shipping_tax_class_id',
        'cod_fee_taxable',
        'cod_fee_tax_class_id',
    ];

    public function defaultTaxClass()
    {
        return $this->belongsTo(TaxClass::class, 'default_tax_class_id');
    }

    public function shippingTaxClass()
    {
        return $this->belongsTo(TaxClass::class, 'shipping_tax_class_id');
    }

    public function codFeeTaxClass()
    {
        return $this->belongsTo(TaxClass::class, 'cod_fee_tax_class_id');
    }
}
