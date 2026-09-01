import React, { Suspense } from 'react';
import AuthLayout from '../../../components/auth/AuthLayout';
import RegisterForm from '../../../components/auth/RegisterForm';

export const metadata = {
  title: 'Customer Registration | E-Commerce Storefront',
  description: 'Create your customer account to enjoy faster checkout, exclusive discounts, and order tracking.',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join ECOMSTORE today to receive exclusive rewards and express checkout."
    >
      <Suspense fallback={<div className="h-56 bg-stone-100 rounded-2xl animate-pulse" />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
