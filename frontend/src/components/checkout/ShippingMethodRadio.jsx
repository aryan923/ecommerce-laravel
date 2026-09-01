"use client";

import React from 'react';
import { Truck, Zap, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const DEFAULT_SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Standard Ground Delivery',
    cost: 0,
    estimated_days: '3-5 Business Days',
    description: 'Reliable nationwide delivery via standard carrier.',
    icon: Truck,
  },
  {
    id: 'express',
    name: 'Express Air Shipping',
    cost: 150,
    estimated_days: '1-2 Business Days',
    description: 'Priority handling & fast air dispatch to your doorstep.',
    icon: Zap,
  },
];

export default function ShippingMethodRadio({
  selectedMethodId,
  onSelectMethod,
  shippingMethods = DEFAULT_SHIPPING_METHODS,
}) {
  const { formatPrice } = useCurrency();
  const options = shippingMethods.length > 0 ? shippingMethods : DEFAULT_SHIPPING_METHODS;

  return (
    <div data-testid="shipping-method-section" className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
      <h3 className="text-sm font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
        <Truck className="w-4 h-4 text-indigo-600" />
        <span>3. Shipping Method</span>
      </h3>

      <div className="space-y-2.5">
        {options.map((method) => {
          const isSelected = selectedMethodId === method.id;
          const Icon = method.icon || Truck;

          return (
            <div
              key={method.id}
              data-testid="shipping-method-option"
              onClick={() => onSelectMethod(method)}
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-stone-800 text-stone-300'
                          : 'bg-stone-200/60 text-stone-600'
                      }`}
                    >
                      {method.estimated_days}
                    </span>
                  </div>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                    {method.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-black ${isSelected ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {method.cost === 0 ? 'FREE' : formatPrice(method.cost)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
