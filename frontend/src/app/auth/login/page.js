import React, { Suspense } from 'react';
import AuthLayout from '../../../components/auth/AuthLayout';
import LoginForm from '../../../components/auth/LoginForm';

export const metadata = {
  title: 'Customer Login | E-Commerce Storefront',
  description: 'Sign in to your customer account to manage orders, wishlists, and checkout faster.',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in with your email and password credentials to access your account."
    >
      <Suspense fallback={<div className="h-48 bg-stone-100 rounded-2xl animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
