"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackingForm from '../../components/tracking/TrackingForm';
import ShipmentSummaryCard from '../../components/tracking/ShipmentSummaryCard';
import TrackingStatusTimeline from '../../components/tracking/TrackingStatusTimeline';
import ShipmentActivityLog from '../../components/tracking/ShipmentActivityLog';
import TrackedItemsList from '../../components/tracking/TrackedItemsList';
import { trackShipment } from '../../lib/tracking';
import { AlertCircle, RefreshCw } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialTrackingCode = searchParams.get('tracking_number') || searchParams.get('order_number') || '';

  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedCode, setSearchedCode] = useState('');

  const handleSearch = async (code, email = '') => {
    setIsLoading(true);
    setError(null);
    setSearchedCode(code);

    try {
      const data = await trackShipment(code, email);
      setTrackingData(data);
    } catch (err) {
      setTrackingData(null);
      setError(err.message || `No shipment found for '${code}'.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingCode) {
      handleSearch(initialTrackingCode);
    }
  }, [initialTrackingCode]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-stone-600 text-sm max-w-lg mx-auto mt-2">
          Check live shipping progress, carrier checkpoints, and estimated delivery dates for your Luxora order.
        </p>
      </div>

      {/* Tracking Search Form */}
      <TrackingForm
        onSearch={handleSearch}
        isLoading={isLoading}
        initialCode={searchedCode || initialTrackingCode}
      />

      {/* Error Alert View */}
      {error && !isLoading && (
        <div className="w-full max-w-2xl mx-auto my-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-red-900">Shipment Not Found</h4>
            <p className="mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="w-full max-w-4xl mx-auto my-8 space-y-4 animate-pulse">
          <div className="h-32 bg-stone-200 rounded-2xl w-full"></div>
          <div className="h-44 bg-stone-200 rounded-2xl w-full"></div>
        </div>
      )}

      {/* Tracking Result Sections */}
      {!isLoading && trackingData && (
        <div className="transition-all duration-300">
          <ShipmentSummaryCard data={trackingData} />
          <TrackingStatusTimeline steps={trackingData.timeline_steps} />
          <ShipmentActivityLog logs={trackingData.activity_log} />
          <TrackedItemsList items={trackingData.items} />
        </div>
      )}
    </div>
  );
}

export default function TrackOrderClient() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-xs uppercase tracking-wider">Loading Order Tracker...</p>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
