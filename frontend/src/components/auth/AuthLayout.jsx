"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  const pathname = usePathname();
  const isLogin = pathname === '/auth/login';
  const isRegister = pathname === '/auth/register';
  const showTabs = isLogin || isRegister;

  return (
    <div data-testid="auth-layout" className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Subtle Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Perfectly Aligned Auth Card */}
      <div className="w-full max-w-[420px] bg-white border border-stone-200/80 rounded-3xl p-7 sm:p-9 shadow-xl shadow-stone-900/5 backdrop-blur-xl relative z-10 space-y-6 my-auto">
        {/* Segmented Auth Navigation Tabs (if on login or register) */}
        {showTabs && (
          <div className="p-1 bg-stone-100/90 border border-stone-200/80 rounded-2xl grid grid-cols-2 text-xs font-extrabold text-center">
            <Link
              href="/auth/login"
              className={`py-2.5 rounded-xl transition-all ${
                isLogin
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className={`py-2.5 rounded-xl transition-all ${
                isRegister
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Header */}
        <div className="space-y-1.5 text-center">
          <h1 data-testid="auth-title" className="text-2xl font-black text-stone-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p data-testid="auth-subtitle" className="text-xs text-stone-500 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Body */}
        <div>
          {children}
        </div>
      </div>

      {/* Footer Security Note */}
      <div className="my-4 flex items-center gap-1.5 text-xs text-stone-400 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>256-Bit SSL Encrypted Checkout</span>
      </div>
    </div>
  );
}
