"use client";

import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, Check } from 'lucide-react';

export default function TrackingStatusTimeline({ steps = [] }) {
  if (!steps || steps.length === 0) return null;

  // Icon mapping for step keys
  const getStepIcon = (key, completed, isCurrent) => {
    if (completed) {
      return <Check className="w-4 h-4 text-white" />;
    }
    
    switch (key) {
      case 'placed':
        return <Package className="w-4 h-4" />;
      case 'processed':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Home className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm my-6">
      <h3 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        <Truck className="w-5 h-5 text-stone-700" />
        <span>Shipment Progress</span>
      </h3>

      {/* Timeline Steps (Desktop & Tablet Horizontal / Mobile Vertical) */}
      <div className="relative">
        
        {/* Desktop Progress Bar Line */}
        <div className="hidden md:block absolute top-5 left-[5%] right-[5%] h-1 bg-stone-200 z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{
              width: `${
                ((steps.filter((s) => s.completed).length - 1) / (steps.length - 1)) * 100
              }%`
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = step.completed;
            const isLastCompleted =
              isCompleted && (idx === steps.length - 1 || !steps[idx + 1]?.completed);

            return (
              <div key={step.key || idx} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                {/* Step Circle Badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-50'
                      : isLastCompleted
                      ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-50 animate-pulse'
                      : 'bg-stone-100 text-stone-400 border border-stone-300'
                  }`}
                >
                  {getStepIcon(step.key, isCompleted, isLastCompleted)}
                </div>

                {/* Step Text Info */}
                <div className="flex-1">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCompleted ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.timestamp ? (
                    <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
                      {formatDate(step.timestamp)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic mt-0.5">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
