"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';

const CurrencyContext = createContext(null);

const DEFAULT_CURRENCY = {
  code: 'INR',
  symbol: '₹',
  rate: 1.0,
  is_default: true,
};

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([DEFAULT_CURRENCY]);
  const [activeCurrency, setActiveCurrency] = useState(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrencies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/currencies');
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setCurrencies(data);
        const defaultCurr = data.find((c) => c.is_default || c.is_default === 1) || data[0];
        if (defaultCurr) {
          setActiveCurrency(defaultCurr);
        }
      }
    } catch (err) {
      console.warn('Currency fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const changeCurrency = (code) => {
    const found = currencies.find((c) => c.code === code);
    if (found) {
      setActiveCurrency(found);
    }
  };

  const formatPrice = (amount) => {
    const num = Number(amount) || 0;
    const rate = Number(activeCurrency.rate) || 1.0;
    const converted = num * rate;
    const symbol = activeCurrency.symbol || '$';

    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        activeCurrency,
        changeCurrency,
        formatPrice,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
