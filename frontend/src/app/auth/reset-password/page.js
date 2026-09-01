import React, { Suspense } from 'react';
import AuthLayout from '../../../components/auth/AuthLayout';
import ResetPasswordForm from '../../../components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | E-Commerce Storefront',
  description: 'Enter your new password to update your customer account security credentials.',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your security token and choose a new password for your account."
    >
      <Suspense fallback={<div className="h-56 bg-stone-100 rounded-2xl animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
