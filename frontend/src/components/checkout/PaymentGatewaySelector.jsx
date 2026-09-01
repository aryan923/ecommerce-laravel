"use client";

import React from 'react';
import { CreditCard, Banknote, Smartphone, ShieldCheck } from 'lucide-react';

const DEFAULT_PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    description: 'Pay cash upon physical delivery at your address.',
    icon: Banknote,
    badge: 'Popular',
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay, Maestro & Amex accepted.',
    icon: CreditCard,
    badge: 'Instant',
  },
  {
    id: 'upi',
    name: 'UPI / Instant Transfer',
    description: 'Google Pay, PhonePe, Paytm & BHIM UPI.',
    icon: Smartphone,
    badge: 'Fast',
  },
];

export default function PaymentGatewaySelector({
  selectedPaymentId,
  onSelectPayment,
  paymentMethods = DEFAULT_PAYMENT_METHODS,
}) {
  const options = paymentMethods.length > 0 ? paymentMethods : DEFAULT_PAYMENT_METHODS;

  return (
    <div data-testid="payment-gateway-section" className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-600" />
          <span>4. Payment Method</span>
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
        </div>
      </div>

      <div className="space-y-2.5">
        {options.map((method) => {
          const isSelected = selectedPaymentId === method.id;
          const Icon = method.icon || CreditCard;

          return (
            <div
              key={method.id}
              data-testid="payment-method-option"
              onClick={() => onSelectPayment(method.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-stone-950 text-white border-stone-950 shadow-md'
                  : 'bg-stone-50/60 hover:bg-white text-stone-900 border-stone-200/80 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-stone-850 text-indigo-400' : 'bg-white text-stone-600 border border-stone-200/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold">{method.name}</h4>
                    {method.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
                            : 'bg-stone-200/60 text-stone-600'
                        }`}
                      >
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                    {method.description}
                  </p>
                </div>
              </div>

              {/* Radio Indicator Circle */}
              <div className="shrink-0">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
