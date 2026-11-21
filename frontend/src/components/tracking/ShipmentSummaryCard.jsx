"use client";

import React from 'react';
import { ExternalLink, Calendar, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';

export default function ShipmentSummaryCard({ data }) {
  if (!data) return null;

  const {
    tracking_number,
    order_number,
    status_label = 'In Transit',
    courier_name = 'Standard Express',
    carrier_tracking_url,
    estimated_delivery,
    shipped_at,
    origin,
    destination
  } = data;

  const formatEstDate = (isoString) => {
    if (!isoString) return 'Pending Update';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (s.includes('transit') || s.includes('shipped')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="w-full bg-stone-900 text-white p-6 sm:p-8 rounded-2xl shadow-md my-6">
      
      {/* Header Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">Tracking Number</span>
            <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadgeStyle(status_label)}`}>
              {status_label}
            </span>
          </div>
          <h2 className="font-mono text-xl sm:text-2xl font-bold text-white mt-1">
            {tracking_number}
          </h2>
        </div>

        {carrier_tracking_url && (
          <a
            href={carrier_tracking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shrink-0"
          >
            <span>Open Carrier Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-xs">
        
        {/* Order ID */}
        <div className="space-y-1">
          <p className="text-stone-400 uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Associated Order</span>
          </p>
          <p className="font-mono font-semibold text-stone-100 text-sm">{order_number || 'N/A'}</p>
        </div>

        {/* Carrier Partner */}
        <div className="space-y-1">
          <p className="text-stone-400 uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Courier Carrier</span>
          </p>
          <p className="font-semibold text-stone-100 text-sm">{courier_name}</p>
        </div>

        {/* Estimated Delivery */}
        <div className="space-y-1">
          <p className="text-stone-400 uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Estimated Delivery</span>
          </p>
          <p className="font-semibold text-emerald-400 text-sm">{formatEstDate(estimated_delivery)}</p>
        </div>

        {/* Destination */}
        <div className="space-y-1">
          <p className="text-stone-400 uppercase tracking-wider text-[11px] font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>Destination</span>
          </p>
          <p className="font-semibold text-stone-100 text-sm">{destination || 'Customer Address'}</p>
        </div>
      </div>
    </div>
  );
}
