"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Plus, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import apiClient from '../../lib/api-client';

export default function ReturnsClient() {
  const { formatPrice } = useCurrency();
  const [returnsList, setReturnsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchReturns = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/customer/returns');
        const list = res.data?.data || res.data || [];
        if (!isCancelled) {
          setReturnsList(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.warn('Returns fetch notice:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchReturns();
    return () => {
      isCancelled = true;
    };
  }, []);

  const getRmaStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'approved':
      case 'refunded':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div data-testid="returns-management" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Returns & Exchanges</h1>
          <p className="text-xs text-stone-500 mt-0.5">Track submitted return requests and refund statuses.</p>
        </div>
        <Link
          href="/account/returns/new"
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request New Return</span>
        </Link>
      </div>

      {/* Returns List */}
      <div className="space-y-3">
        {returnsList.map((ret) => (
          <div
            key={ret.id || ret.return_number}
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-stone-900 text-sm">RMA #{ret.return_number || ret.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getRmaStatusBadge(ret.status)}`}>
                  {ret.status || 'Pending Approval'}
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Reason: <span className="font-bold text-stone-900">{ret.reason || 'Defective / Size Issue'}</span> &bull; Order #: {ret.order_number || ret.order_id || 'N/A'}
              </p>
              <p className="text-[11px] text-stone-400">
                Submitted on {new Date(ret.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
              <span className="text-xs font-bold text-stone-500 block">Refund Estimate</span>
              <span className="text-sm font-black text-stone-900">{formatPrice(ret.refund_amount || 0)}</span>
            </div>
          </div>
        ))}

        {!isLoading && returnsList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
            <RefreshCw className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-900">No Return Requests Found</h3>
            <p className="text-xs text-stone-500">You have no active return or exchange requests.</p>
            <Link
              href="/account/returns/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
            >
              <span>Submit Return Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
