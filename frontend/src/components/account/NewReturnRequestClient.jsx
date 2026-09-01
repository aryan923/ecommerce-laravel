"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, Send, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api-client';

const REASONS = [
  'Defective or damaged product',
  'Wrong size / fit issue',
  'Received incorrect item',
  'Style preference / changed mind',
  'Product not as described',
];

const REFUND_METHODS = [
  { id: 'original', label: 'Original Payment Method (Card/UPI)' },
  { id: 'store_credit', label: 'Store Credit / Gift Card' },
  { id: 'bank_account', label: 'Saved Bank Account (Instant Refund)' },
];

export default function NewReturnRequestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const preselectedOrder = searchParams.get('order');
  const [orders, setOrders] = useState([]);
  const [selectedOrderNum, setSelectedOrderNum] = useState(preselectedOrder || '');
  const [reason, setReason] = useState(REASONS[0]);
  const [refundMethod, setRefundMethod] = useState('original');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const res = await apiClient.get('/customer/orders');
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          setOrders(list);
          if (!selectedOrderNum && list.length > 0) {
            setSelectedOrderNum(list[0].order_number);
          }
        }
      } catch (err) {
        console.warn('Delivered orders fetch notice:', err);
      }
    };

    fetchDeliveredOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderNum) {
      showToast('Please select a valid order to return', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/customer/returns', {
        order_number: selectedOrderNum,
        reason,
        refund_method: refundMethod,
        comments,
      });
      showToast('Return request submitted successfully', 'success');
      router.push('/account/returns');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit return request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="new-return-request" className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stone-200/80 pb-3">
        <Link href="/account/returns" className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4 text-stone-700" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-stone-900 tracking-tight">Initiate Return or Exchange</h1>
          <p className="text-xs text-stone-500 mt-0.5">Submit an RMA request for return or exchange inspection.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        {/* Order Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-stone-700">Select Order to Return</label>
          <select
            value={selectedOrderNum}
            onChange={(e) => setSelectedOrderNum(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Choose Delivered Order --</option>
            {orders.map((o) => (
              <option key={o.order_number} value={o.order_number}>
                {o.order_number} &bull; Placed {new Date(o.created_at || Date.now()).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Reason Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-stone-700">Reason for Return</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Refund Method Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700">Preferred Refund Destination</label>
          <div className="space-y-2">
            {REFUND_METHODS.map((m) => (
              <label
                key={m.id}
                onClick={() => setRefundMethod(m.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs font-bold ${
                  refundMethod === m.id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  refundMethod === m.id ? 'border-white bg-white text-stone-900' : 'border-stone-400'
                }`}>
                  {refundMethod === m.id && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-stone-700">Additional Remarks / Feedback</label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Describe the issue with the product in detail..."
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit RMA Return Request'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
