"use client";

import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, Building, Globe, Postcode } from 'lucide-react';

export default function SavedAddressSelector({
  address,
  onAddressChange,
  savedAddresses = [],
  isAuthenticated = false,
}) {
  const [selectedSavedId, setSelectedSavedId] = useState(savedAddresses[0]?.id || 'custom');

  const handleSavedSelect = (saved) => {
    setSelectedSavedId(saved.id);
    onAddressChange({
      address_line_1: saved.address_line_1 || '',
      address_line_2: saved.address_line_2 || '',
      city: saved.city || '',
      state: saved.state || '',
      postal_code: saved.postal_code || '',
      country: saved.country || 'India',
    });
  };

  return (
    <div data-testid="saved-address-selector" className="space-y-4">
      {/* Saved Addresses List for Logged-In Users */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700">
            Select Saved Shipping Address
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((saved) => {
              const isSelected = selectedSavedId === saved.id;
              return (
                <div
                  key={saved.id}
                  onClick={() => handleSavedSelect(saved)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                      : 'bg-white text-stone-900 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-stone-400'}`} />
                      <span className="text-xs font-bold">{saved.label || 'Home Address'}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                    {saved.address_line_1}, {saved.city}, {saved.state} {saved.postal_code}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Address Form */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <h3 className="text-sm font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span>2. Shipping Address</span>
        </h3>

        {/* Address Line 1 */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-stone-600">Street Address</label>
          <input
            data-testid="address-line1-input"
            type="text"
            value={address.address_line_1}
            onChange={(e) => onAddressChange({ ...address, address_line_1: e.target.value })}
            placeholder="Flat / House No., Street, Landmark"
            className="w-full px-3.5 py-3 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Address Line 2 */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-stone-600">Apartment / Suite (Optional)</label>
          <input
            type="text"
            value={address.address_line_2}
            onChange={(e) => onAddressChange({ ...address, address_line_2: e.target.value })}
            placeholder="Apt, Suite, Building floor"
            className="w-full px-3.5 py-3 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* City & State Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-stone-600">City</label>
            <input
              data-testid="city-input"
              type="text"
              value={address.city}
              onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
              placeholder="e.g. Mumbai"
              className="w-full px-3.5 py-3 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-stone-600">State / Region</label>
            <input
              data-testid="state-input"
              type="text"
              value={address.state}
              onChange={(e) => onAddressChange({ ...address, state: e.target.value })}
              placeholder="e.g. Maharashtra"
              className="w-full px-3.5 py-3 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Postal Code & Country Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-stone-600">Postal / PIN Code</label>
            <input
              data-testid="postal-code-input"
              type="text"
              value={address.postal_code}
              onChange={(e) => onAddressChange({ ...address, postal_code: e.target.value })}
              placeholder="e.g. 400001"
              className="w-full px-3.5 py-3 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-stone-600">Country</label>
            <input
              type="text"
              value={address.country}
              onChange={(e) => onAddressChange({ ...address, country: e.target.value })}
              placeholder="India"
              className="w-full px-3.5 py-3 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
