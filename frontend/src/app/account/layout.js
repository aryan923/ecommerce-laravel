"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AccountSidebar from '../../components/account/AccountSidebar';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';

export default function AccountLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account');
    }
  }, [isAuthenticated, isLoading, router]);

  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    { label: 'My Account' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50/40 py-12 flex items-center justify-center text-stone-500 text-xs font-bold">
        Loading customer account portal...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div data-testid="account-portal-layout" className="min-h-screen bg-stone-50/40 text-stone-900 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <AccountSidebar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
