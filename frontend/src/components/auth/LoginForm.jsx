"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect') || '/';

  const { login, isLoading, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login({ email, password, remember: rememberMe });
      router.push(redirectUrl);
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Auth Error Banner */}
      {authError && (
        <div data-testid="auth-error-alert" className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            data-testid="login-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              if (authError) setAuthError(null);
            }}
            placeholder="name@example.com"
            className={`w-full pl-10 pr-4 py-3.5 text-xs font-medium bg-stone-50/80 border rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:bg-white transition-all ${
              fieldErrors.email ? 'border-rose-400 focus:ring-rose-500/10' : 'border-stone-300/80 focus:border-indigo-600 focus:ring-indigo-500/10'
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Password
          </label>
          <Link
            data-testid="forgot-password-link"
            href="/auth/forgot-password"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
            <Lock className="w-4 h-4" />
          </div>
          <input
            data-testid="login-password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
              if (authError) setAuthError(null);
            }}
            placeholder="Enter your password"
            className={`w-full pl-10 pr-12 py-3.5 text-xs font-medium bg-stone-50/80 border rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:bg-white transition-all ${
              fieldErrors.password ? 'border-rose-400 focus:ring-rose-500/10' : 'border-stone-300/80 focus:border-indigo-600 focus:ring-indigo-500/10'
            }`}
          />
          <button
            type="button"
            data-testid="toggle-password-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 p-1.5 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors z-10"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.password}</p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-stone-300"
          />
          <span className="text-xs font-semibold text-stone-700">Remember me on this device</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-testid="login-submit-btn"
        disabled={isLoading}
        className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 disabled:opacity-50 text-white text-xs font-extrabold tracking-wider uppercase rounded-2xl transition-all shadow-lg shadow-stone-950/15 hover:shadow-stone-950/25 flex items-center justify-center gap-2"
      >
        <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Link to Register */}
      <div className="pt-4 text-center border-t border-stone-100">
        <p className="text-xs text-stone-500 font-medium">
          Don't have an account yet?{' '}
          <Link
            data-testid="register-page-link"
            href="/auth/register"
            className="font-bold text-stone-900 hover:text-indigo-600 underline transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </form>
  );
}
