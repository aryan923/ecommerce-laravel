"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams?.get('token') || '';
  const emailFromUrl = searchParams?.get('email') || '';

  const { resetPassword, isLoading, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [emailFromUrl, tokenFromUrl]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!token.trim()) {
      errors.token = 'Reset token is required.';
    }
    if (!password) {
      errors.password = 'New password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (password !== passwordConfirmation) {
      errors.password_confirmation = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccessMessage('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <form data-testid="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Auth Error Banner */}
      {authError && (
        <div data-testid="auth-error-alert" className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div data-testid="reset-password-success" className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Token Input (Read-only or Token display) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
          Reset Security Token
        </label>
        <input
          data-testid="reset-token-input"
          type="text"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            if (fieldErrors.token) setFieldErrors((prev) => ({ ...prev, token: null }));
          }}
          placeholder="Paste reset token if not auto-filled"
          className={`w-full px-4 py-3 text-xs font-mono font-medium bg-stone-50 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
            fieldErrors.token ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-500'
          }`}
        />
        {fieldErrors.token && (
          <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.token}</p>
        )}
      </div>

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
            data-testid="reset-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              if (authError) setAuthError(null);
            }}
            placeholder="name@example.com"
            className={`w-full pl-10 pr-4 py-3 text-xs font-medium bg-stone-50 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              fieldErrors.email ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-500'
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              data-testid="reset-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                if (authError) setAuthError(null);
              }}
              placeholder="Min. 8 chars"
              className={`w-full pl-10 pr-10 py-3 text-xs font-medium bg-stone-50 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                fieldErrors.password ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* Password Confirmation */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              data-testid="reset-confirm-password-input"
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value);
                if (fieldErrors.password_confirmation) setFieldErrors((prev) => ({ ...prev, password_confirmation: null }));
                if (authError) setAuthError(null);
              }}
              placeholder="Repeat password"
              className={`w-full pl-10 pr-4 py-3 text-xs font-medium bg-stone-50 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                fieldErrors.password_confirmation ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-500'
              }`}
            />
          </div>
          {fieldErrors.password_confirmation && (
            <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.password_confirmation}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-testid="reset-password-submit-btn"
        disabled={isLoading}
        className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 disabled:opacity-50 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-stone-950/20 flex items-center justify-center gap-2"
      >
        <span>{isLoading ? 'Resetting Password...' : 'Reset Account Password'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Back to Login Link */}
      <div className="pt-4 text-center border-t border-stone-100">
        <Link
          href="/auth/login"
          className="text-xs font-bold text-stone-700 hover:text-indigo-600 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}
