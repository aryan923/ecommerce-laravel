"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordForm() {
  const { forgotPassword, isLoading, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);

  const validate = () => {
    if (!email.trim()) {
      setFieldError('Email address is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError('Please enter a valid email address.');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await forgotPassword(email);
      setSuccessMessage(`Password reset link sent successfully to ${email}. Please check your inbox.`);
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <form data-testid="forgot-password-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Auth Error Banner */}
      {authError && (
        <div data-testid="auth-error-alert" className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div data-testid="forgot-password-success" className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-900 text-xs font-medium space-y-1">
          <div className="flex items-center gap-2 font-extrabold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Reset Instructions Sent!</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">{successMessage}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
          Registered Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            data-testid="forgot-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError) setFieldError('');
              if (authError) setAuthError(null);
            }}
            placeholder="name@example.com"
            className={`w-full pl-10 pr-4 py-3 text-xs font-medium bg-stone-50 border rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              fieldError ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-indigo-500'
            }`}
          />
        </div>
        {fieldError && (
          <p className="text-[11px] font-semibold text-rose-600">{fieldError}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-testid="forgot-password-submit-btn"
        disabled={isLoading}
        className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 disabled:opacity-50 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-stone-950/20 flex items-center justify-center gap-2"
      >
        <span>{isLoading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Back to Login Link */}
      <div className="pt-4 text-center border-t border-stone-100">
        <Link
          data-testid="back-to-login-link"
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
}
