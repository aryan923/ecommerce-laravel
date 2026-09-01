import React, { Suspense } from 'react';
import AuthLayout from '../../../components/auth/AuthLayout';
import ForgotPasswordForm from '../../../components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | E-Commerce Storefront',
  description: 'Recover your customer account password by receiving a secure password reset link in your email inbox.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recover Password"
      subtitle="Enter your registered email address below to receive password reset instructions."
    >
      <Suspense fallback={<div className="h-44 bg-stone-100 rounded-2xl animate-pulse" />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
