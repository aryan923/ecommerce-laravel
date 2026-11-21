"use client";

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function TrackingForm({ onSearch, isLoading, initialCode = '' }) {
  const [trackingNumber, setTrackingNumber] = useState(initialCode);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setErrorMessage('Please enter a tracking number or order number.');
      return;
    }
    setErrorMessage('');
    onSearch(trackingNumber.trim(), email.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mb-2 text-center">
        Track Your Shipment
      </h2>
      <p className="text-stone-500 text-xs sm:text-sm text-center mb-6">
        Enter your tracking number or order number below for real-time delivery status updates.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tracking-number-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
            Tracking Number or Order ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="tracking-number-input"
              type="text"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. TRK-9823471029 or ORD-2026-8819"
              className="w-full pl-4 pr-10 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-mono"
            />
            <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
          {errorMessage && (
            <p className="text-red-600 text-xs mt-1.5 font-medium">{errorMessage}</p>
          )}
        </div>

        <div>
          <label htmlFor="tracking-email-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
            Billing Email Address <span className="text-stone-400 font-normal lowercase">(optional for guest lookup)</span>
          </label>
          <input
            id="tracking-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. customer@example.com"
            className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching Shipment...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Order</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
