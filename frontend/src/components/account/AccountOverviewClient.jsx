"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, RefreshCw, MapPin, User, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import apiClient from '../../lib/api-client';

export default function AccountOverviewClient() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState({ ordersCount: 0, returnsCount: 0, addressesCount: 0 });
  const [recentOrder, setRecentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchOverviewData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, returnsRes, addrRes] = await Promise.allSettled([
          apiClient.get('/customer/orders'),
          apiClient.get('/customer/returns'),
          apiClient.get('/customer/addresses'),
        ]);

        if (isCancelled) return;

        const ordersList = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || ordersRes.value.data || []) : [];
        const returnsList = returnsRes.status === 'fulfilled' ? (returnsRes.value.data?.data || returnsRes.value.data || []) : [];
        const addrList = addrRes.status === 'fulfilled' ? (addrRes.value.data?.data || addrRes.value.data || []) : [];

        setStats({
          ordersCount: Array.isArray(ordersList) ? ordersList.length : 0,
          returnsCount: Array.isArray(returnsList) ? returnsList.length : 0,
          addressesCount: Array.isArray(addrList) ? addrList.length : 0,
        });

        if (Array.isArray(ordersList) && ordersList.length > 0) {
          setRecentOrder(ordersList[0]);
        }
      } catch (err) {
        console.warn('Overview fetch notice:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchOverviewData();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div data-testid="account-overview" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage your recent orders, addresses, returns, and security settings from your personal dashboard.
          </p>
        </div>
        <Link
          href="/products"
          className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-900 text-xs font-extrabold rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <span>Shop New Arrivals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.ordersCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/account/returns"
          className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-stone-500 font-medium">Returns & Exchanges</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.returnsCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <RefreshCw className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-stone-500 font-medium">Saved Addresses</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.addressesCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Recent Order Preview */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Most Recent Order</span>
          </h3>
          <Link href="/account/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            View All Orders &rarr;
          </Link>
        </div>

        {recentOrder ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50/80 border border-stone-200/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 text-xs">{recentOrder.order_number}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {recentOrder.status || 'Processing'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(recentOrder.created_at || Date.now()).toLocaleDateString()} &bull; Total: {formatPrice(recentOrder.total_amount || 0)}
              </p>
            </div>
            <Link
              href={`/account/orders/${recentOrder.order_number}`}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold rounded-xl transition-all shrink-0"
            >
              View Order Details
            </Link>
          </div>
        ) : (
          <p className="text-xs text-stone-500 py-2">No recent orders found. Start shopping to create your first order!</p>
        )}
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/profile"
          className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-stone-900">Profile & Security</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Update personal info and account password</p>
          </div>
        </Link>

        <Link
          href="/account/bank-accounts"
          className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-stone-400 transition-all flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-stone-900">Refund Bank Accounts</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">Manage bank accounts for instant refund processing</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
