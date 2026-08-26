"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, ShoppingBag, Settings, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-1.5 text-stone-700 hover:text-stone-950 transition-colors"
          title="Account & Sign In"
          data-testid="account-dropdown-trigger"
        >
          <User className="w-5 h-5" />
        </button>

        {isOpen && (
          <div
            data-testid="account-dropdown-menu"
            className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50 py-2"
          >
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 hover:text-stone-950 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-950 transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    );
  }

  const displayName = user?.first_name || user?.name || 'Account';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 text-stone-700 hover:text-stone-950 transition-colors flex items-center gap-1"
        title={displayName}
      >
        <User className="w-5 h-5" />
        <span className="text-xs font-medium max-w-[80px] truncate hidden sm:inline">{displayName}</span>
      </button>

      {isOpen && (
        <div
          data-testid="account-dropdown-menu"
          className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50 py-2"
        >
          <div className="px-4 py-2 border-b border-stone-200">
            <p className="text-xs font-bold text-stone-900 truncate">{displayName}</p>
            <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-stone-500" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-stone-500" />
              <span>My Orders</span>
            </Link>
            <Link
              href="/account/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            >
              <Settings className="w-4 h-4 text-stone-500" />
              <span>Profile Settings</span>
            </Link>
          </div>

          <div className="border-t border-stone-200 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
