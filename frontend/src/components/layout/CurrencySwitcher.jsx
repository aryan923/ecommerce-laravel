"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function CurrencySwitcher() {
  const { currencies, activeCurrency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 py-1.5 px-2.5 rounded-lg border border-stone-300/80 bg-stone-100/60 hover:bg-stone-200/60 transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-stone-500" />
        <span>{activeCurrency?.code || 'USD'}</span>
        <span className="text-stone-500 font-semibold">{activeCurrency?.symbol || '$'}</span>
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Currency Dropdown */}
      {isOpen && (
        <div
          data-testid="currency-switcher-dropdown"
          className="absolute right-0 top-full mt-2 w-36 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50 py-1"
        >
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => {
                changeCurrency(currency.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                activeCurrency?.code === currency.code
                  ? 'bg-amber-100/60 text-amber-900 font-semibold'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
              }`}
            >
              <span>{currency.code}</span>
              <span className="font-mono text-stone-400">{currency.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
