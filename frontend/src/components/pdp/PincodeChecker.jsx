"use client";

import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../../lib/api-client';

export default function PincodeChecker({ productId }) {
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 4) {
      setResult({
        success: false,
        message: 'Please enter a valid pincode / postal code',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await apiClient.post('/shipping/calculate', {
        pincode: pincode.trim(),
        product_id: productId,
      }, { timeout: 3000 });

      const data = res.data.data || res.data;
      setResult({
        success: true,
        serviceable: true,
        estimatedDays: data.estimated_days || '3-5',
        deliveryDate: data.delivery_date || 'Standard Delivery within 3-5 days',
        shippingFee: data.shipping_fee === 0 ? 'Free Shipping' : `$${data.shipping_fee || 5.00}`,
      });
    } catch (err) {
      // Fallback calculation for demonstration/offline mode
      setResult({
        success: true,
        serviceable: true,
        estimatedDays: '2-4',
        deliveryDate: 'Standard Shipping (Delivery by 3-5 business days)',
        shippingFee: 'Free Shipping on orders above $50',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="pincode-checker" className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
        <MapPin className="w-4 h-4 text-amber-700" />
        <span>Check Delivery & Serviceability</span>
      </div>

      <form onSubmit={handleCheckPincode} className="flex gap-2">
        <input
          data-testid="pincode-input"
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder="Enter 6-digit Pincode"
          maxLength={10}
          className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700 transition-all font-medium"
        />
        <button
          data-testid="pincode-submit-btn"
          type="submit"
          disabled={isLoading}
          className="bg-stone-900 hover:bg-stone-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div
          data-testid="pincode-result"
          className={`p-3 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
            result.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
              : 'bg-rose-50 text-rose-900 border border-rose-200/80'
          }`}
        >
          {result.success ? (
            <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}

          <div className="flex flex-col gap-0.5">
            <span className="font-bold">{result.success ? 'Delivery Available' : 'Notice'}</span>
            <span className="text-[11px] opacity-90">{result.deliveryDate || result.message}</span>
            {result.shippingFee && (
              <span className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                {result.shippingFee}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
