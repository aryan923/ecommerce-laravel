"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, RefreshCw, XCircle, CheckCircle, Download } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api-client';

const TRACKING_STEPS = ['Order Placed', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function OrderDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const orderNumber = params?.order_number;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrderDetail = async () => {
    if (!orderNumber) return;
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/customer/orders/${orderNumber}`);
      const data = res.data?.data || res.data;
      setOrder(data);
    } catch (err) {
      console.warn('Order detail fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      await apiClient.post(`/customer/orders/${orderNumber}/cancel`, {
        cancellation_reason: 'Customer requested cancellation via portal',
      });
      showToast('Order cancelled successfully', 'info');
      fetchOrderDetail();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center text-xs font-bold text-stone-500">
        Loading order invoice details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center space-y-3">
        <Package className="w-8 h-8 text-stone-300 mx-auto" />
        <h3 className="text-sm font-bold text-stone-900">Order Not Found</h3>
        <p className="text-xs text-stone-500">The requested order number could not be retrieved.</p>
        <Link href="/account/orders" className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl">
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const shippingAddress = order.shipping_address || {};
  const status = (order.status || 'processing').toLowerCase();
  const canCancel = status === 'pending' || status === 'processing';

  let currentStepIdx = 1;
  if (status === 'shipped') currentStepIdx = 2;
  if (status === 'delivered') currentStepIdx = 4;
  if (status === 'cancelled') currentStepIdx = -1;

  return (
    <div data-testid="order-detail-view" className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/account/orders" className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 text-stone-700" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-stone-900">{order.order_number}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-stone-900 text-white">
                {order.status || 'Processing'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(order.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canCancel && (
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isCancelling ? 'Cancelling...' : 'Cancel Order'}</span>
            </button>
          )}

          {status === 'delivered' && (
            <Link
              href={`/account/returns/new?order=${order.order_number}`}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-extrabold rounded-xl border border-amber-200 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Request Return / Exchange</span>
            </Link>
          )}
        </div>
      </div>

      {/* Shipment Status Progress Bar */}
      {status !== 'cancelled' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Shipment Tracking Status</span>
          </h3>

          <div className="grid grid-cols-5 gap-2 relative">
            {TRACKING_STEPS.map((stepLabel, idx) => {
              const isStepDone = idx <= currentStepIdx;

              return (
                <div key={stepLabel} className="flex flex-col items-center text-center gap-2 relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isStepDone ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {isStepDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold ${isStepDone ? 'text-stone-900' : 'text-stone-400'}`}>
                    {stepLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Info & Address Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping Address */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <h3 className="text-xs font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>Delivery Destination</span>
          </h3>
          <p className="text-xs text-stone-700 font-bold">{order.customer_name || 'Valued Customer'}</p>
          <p className="text-xs text-stone-600 leading-relaxed">
            {shippingAddress.address_line_1 || 'Address details'}<br />
            {shippingAddress.city || 'Mumbai'}, {shippingAddress.state || 'Maharashtra'} - {shippingAddress.postal_code || '400001'}<br />
            {shippingAddress.country || 'India'}
          </p>
          <p className="text-xs text-stone-500 font-medium pt-1">Phone: {order.customer_phone || '+91 9876543210'}</p>
        </div>

        {/* Payment Info */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <h3 className="text-xs font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Payment Summary</span>
          </h3>
          <p className="text-xs text-stone-600">
            Payment Method: <span className="font-bold text-stone-900">{order.payment_method_id || 'Credit Card / UPI'}</span>
          </p>
          <p className="text-xs text-stone-600">
            Payment Status: <span className="font-extrabold text-emerald-700">PAID</span>
          </p>
          <p className="text-xs text-stone-600">
            Grand Total: <span className="font-black text-stone-900">{formatPrice(order.total_amount || 0)}</span>
          </p>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100">
          <h3 className="text-xs font-extrabold text-stone-900">Purchased Items Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200/80 font-extrabold text-stone-500 uppercase text-[10px]">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-center">Price</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800 font-medium">
              {items.map((item, idx) => {
                const product = item.product || {};
                const imageSrc = item.image_url || product.primary_image_url || '/placeholder.png';
                const unitPrice = item.unit_price || item.price || product.price || 0;

                return (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative shrink-0">
                          {imageSrc && imageSrc !== '/placeholder.png' ? (
                            <Image src={imageSrc} alt={item.name || 'Product'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">No Img</div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block truncate">{item.name || product.name || 'Item'}</span>
                          {item.variant_sku && <span className="text-[10px] text-stone-400 font-mono">SKU: {item.variant_sku}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{formatPrice(unitPrice)}</td>
                    <td className="py-3 px-4 text-center font-bold">{item.quantity || 1}</td>
                    <td className="py-3 px-4 text-right font-bold text-stone-900">
                      {formatPrice(unitPrice * (item.quantity || 1))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
