"use client";

import React from 'react';
import { UserCheck, MapPin, Truck, CreditCard, Check } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'Contact Info', icon: UserCheck },
  { id: 2, name: 'Shipping Address', icon: MapPin },
  { id: 3, name: 'Delivery Method', icon: Truck },
  { id: 4, name: 'Payment', icon: CreditCard },
];

export default function CheckoutSteps({ currentStep, onStepClick }) {
  return (
    <div data-testid="checkout-steps" className="w-full bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="grid grid-cols-4 gap-2 relative">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
              disabled={!isCompleted && !isActive}
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 p-2 rounded-xl transition-all ${
                isCompleted
                  ? 'text-emerald-700 hover:bg-emerald-50 cursor-pointer'
                  : isActive
                  ? 'text-stone-900 font-extrabold bg-stone-100/90 border border-stone-200/80 shadow-2xs'
                  : 'text-stone-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isActive
                    ? 'bg-stone-950 text-white shadow-md'
                    : 'bg-stone-100 text-stone-400 border border-stone-200/60'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="text-center sm:text-left min-w-0">
                <p className="text-[10px] font-bold tracking-wider opacity-60">Step 0{step.id}</p>
                <p className="text-xs font-bold truncate hidden sm:block">{step.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
