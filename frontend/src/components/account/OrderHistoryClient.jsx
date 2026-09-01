"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search, ArrowRight, Eye, Calendar, DollarSign } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import apiClient from '../../lib/api-client';

const STATUS_TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderHistoryClient() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/customer/orders');
        const list = res.data?.data || res.data || [];
        if (!isCancelled) {
          setOrders(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.warn('Orders fetch notice:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isCancelled = true;
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const statusMatch = activeTab === 'All' || (order.status || '').toLowerCase() === activeTab.toLowerCase();
    const queryMatch = !searchQuery.trim() || (order.order_number || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
    return statusMatch && queryMatch;
  });

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div data-testid="order-history-list" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Order History</h1>
          <p className="text-xs text-stone-500 mt-0.5">Track your placed orders, invoices, and shipment status.</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const itemCount = order.items_count || order.items?.length || 1;
          const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={order.id || order.order_number}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-stone-300 transition-all"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-stone-900 text-sm">{order.order_number}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(order.status)}`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {orderDate}
                  </span>
                  <span>&bull;</span>
                  <span>{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                  <span>&bull;</span>
                  <span className="font-bold text-stone-900">Total: {formatPrice(order.total_amount || order.grand_total || 0)}</span>
                </div>
              </div>

              <Link
                href={`/account/orders/${order.order_number}`}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Order Details</span>
              </Link>
            </div>
          );
        })}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
            <Package className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900">No Orders Found</h3>
            <p className="text-xs text-stone-500">
              {searchQuery ? 'No orders match your search query.' : 'You have not placed any orders yet.'}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
