"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, authError, setAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (password !== passwordConfirmation) {
      errors.password_confirmation = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      errors.terms = 'You must accept the terms and conditions.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    try {
      await register({
        name: name.trim(),
        first_name: firstName,
        last_name: lastName,
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        terms_accepted: termsAccepted,
      });
      router.push('/');
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <form data-testid="register-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Auth Error Banner */}
      {authError && (
        <div data-testid="auth-error-alert" className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <User className="w-4 h-4" />
          </div>
          <input
            data-testid="register-name-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
              if (authError) setAuthError(null);
            }}
            placeholder="Jane Doe"
            className={`w-full pl-10 pr-4 py-3.5 text-xs font-medium bg-stone-50/80 border rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:bg-white transition-all ${
              fieldErrors.name ? 'border-rose-400 focus:ring-rose-500/10' : 'border-stone-300/80 focus:border-indigo-600 focus:ring-indigo-500/10'
            }`}
          />
        </div>
        {fieldErrors.name && (
          <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.name}</p>
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
            data-testid="register-email-input"
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

      {/* Password Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              data-testid="register-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                if (authError) setAuthError(null);
              }}
              placeholder="Min. 8 chars"
              className={`w-full pl-10 pr-10 py-3.5 text-xs font-medium bg-stone-50/80 border rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:bg-white transition-all ${
                fieldErrors.password ? 'border-rose-400 focus:ring-rose-500/10' : 'border-stone-300/80 focus:border-indigo-600 focus:ring-indigo-500/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-900 transition-colors"
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
              data-testid="register-confirm-password-input"
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value);
                if (fieldErrors.password_confirmation) setFieldErrors((prev) => ({ ...prev, password_confirmation: null }));
                if (authError) setAuthError(null);
              }}
              placeholder="Repeat password"
              className={`w-full pl-10 pr-4 py-3.5 text-xs font-medium bg-stone-50/80 border rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:bg-white transition-all ${
                fieldErrors.password_confirmation ? 'border-rose-400 focus:ring-rose-500/10' : 'border-stone-300/80 focus:border-indigo-600 focus:ring-indigo-500/10'
              }`}
            />
          </div>
          {fieldErrors.password_confirmation && (
            <p className="text-[11px] font-semibold text-rose-600">{fieldErrors.password_confirmation}</p>
          )}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            data-testid="terms-checkbox"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (fieldErrors.terms) setFieldErrors((prev) => ({ ...prev, terms: null }));
            }}
            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-stone-300"
          />
          <span className="text-xs text-stone-600 leading-normal">
            I agree to the <span className="font-bold text-stone-900">Terms of Service</span> and <span className="font-bold text-stone-900">Privacy Policy</span>.
          </span>
        </label>
        {fieldErrors.terms && (
          <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.terms}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        data-testid="register-submit-btn"
        disabled={isLoading}
        className="w-full py-3.5 px-6 bg-stone-950 hover:bg-stone-850 disabled:opacity-50 text-white text-xs font-extrabold tracking-wider uppercase rounded-2xl transition-all shadow-lg shadow-stone-950/15 hover:shadow-stone-950/25 flex items-center justify-center gap-2"
      >
        <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Link to Login */}
      <div className="pt-4 text-center border-t border-stone-100">
        <p className="text-xs text-stone-500 font-medium">
          Already have an account?{' '}
          <Link
            data-testid="login-page-link"
            href="/auth/login"
            className="font-bold text-stone-900 hover:text-indigo-600 underline transition-colors"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </form>
  );
}
