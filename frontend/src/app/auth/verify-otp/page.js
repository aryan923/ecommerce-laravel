import React, { Suspense } from 'react';
import VerifyOtpClient from './VerifyOtpClient';

export const metadata = {
  title: 'OTP Verification & Security | Luxora Storefront',
  description: 'Enter your 6-digit verification code to activate your account or validate password reset.',
};

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-400 text-sm">
          Loading Security Verification...
        </div>
      }
    >
      <VerifyOtpClient />
    </Suspense>
  );
}
