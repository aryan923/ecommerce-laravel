"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import OtpForm from '../../../components/auth/OtpForm';

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || 'user@example.com';
  const type = searchParams.get('type') || 'registration';
  const redirect = searchParams.get('redirect') || '/account';

  const handleSuccess = (res) => {
    if (type === 'password_reset') {
      const resetToken = res?.reset_token || res?.data?.reset_token || 'reset_stage_token';
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`);
    } else {
      router.push(redirect);
    }
  };

  const handleChangeEmail = () => {
    if (type === 'password_reset') {
      router.push('/auth/forgot-password');
    } else {
      router.push('/auth/register');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo / Lock Shield Graphic */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-3xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            {type === 'password_reset' ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {type === 'password_reset' ? 'Password Security Code' : 'Verify Your Email'}
        </h1>
        <p className="mt-1 text-center text-xs sm:text-sm text-stone-500">
          {type === 'password_reset'
            ? 'Enter the 6-digit code to reset your account password.'
            : 'Complete verification to activate your Luxora account.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-stone-200/80 rounded-3xl space-y-6">
          <OtpForm
            email={email}
            type={type}
            onSuccess={handleSuccess}
            onChangeEmail={handleChangeEmail}
          />

          {/* Navigation Helper Links */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {type === 'password_reset' ? 'Forgot Password' : 'Register'}</span>
            </button>

            <Link
              href="/auth/login"
              className="font-bold text-amber-800 hover:text-amber-900 hover:underline transition-colors"
            >
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
