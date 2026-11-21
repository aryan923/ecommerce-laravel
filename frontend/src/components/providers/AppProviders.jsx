"use client";

import React, { useEffect } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import { ToastProvider } from '../../context/ToastContext';
import { CurrencyProvider } from '../../context/CurrencyContext';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { WishlistProvider } from '../../context/WishlistContext';
import { CompareProvider } from '../../context/CompareContext';
import CompareBar from '../compare/CompareBar';
import { getOrCreateGuestSessionId } from '../../lib/session';

export default function AppProviders({ children }) {
  useEffect(() => {
    getOrCreateGuestSessionId();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <CompareProvider>
                  {children}
                  <CompareBar />
                </CompareProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
