"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Package,
  RefreshCw,
  MapPin,
  Building2,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/profile', label: 'Profile & Security', icon: User },
  { href: '/account/orders', label: 'Order History', icon: Package },
  { href: '/account/returns', label: 'Returns & Exchanges', icon: RefreshCw },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
  { href: '/account/bank-accounts', label: 'Refund Bank Accounts', icon: Building2 },
  { href: '/account/notifications', label: 'Notifications', icon: Bell },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userName = user?.name || 'Valued Customer';
  const userEmail = user?.email || 'customer@example.com';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <aside data-testid="account-sidebar" className="w-full lg:w-72 shrink-0 space-y-6">
      {/* User Header Profile Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-stone-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold text-stone-900 truncate">{userName}</h3>
          <p className="text-xs text-stone-500 truncate">{userEmail}</p>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-3 shadow-xs">
        {/* Desktop Vertical Nav & Mobile Horizontal Tabs */}
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 hidden lg:block ${isActive ? 'text-white' : 'text-stone-300'}`}
                />
              </Link>
            );
          })}

          <div className="my-2 border-t border-stone-100 hidden lg:block" />

          {/* Logout Action */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all shrink-0 whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
