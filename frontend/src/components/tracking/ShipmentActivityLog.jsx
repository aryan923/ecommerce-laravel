"use client";

import React from 'react';
import { ListFilter, MapPin } from 'lucide-react';

export default function ShipmentActivityLog({ logs = [] }) {
  if (!logs || logs.length === 0) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm my-6">
      <h3 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        <ListFilter className="w-5 h-5 text-stone-700" />
        <span>Tracking History & Checkpoints</span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              <th className="pb-3 pr-4">Date / Time</th>
              <th className="pb-3 px-4">Location</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-3.5 pr-4 font-mono text-stone-500 whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </td>
                <td className="py-3.5 px-4 font-medium text-stone-900 flex items-center gap-1.5 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{log.location}</span>
                </td>
                <td className="py-3.5 px-4 font-semibold text-stone-900 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-[11px]">
                    {log.status}
                  </span>
                </td>
                <td className="py-3.5 pl-4 text-stone-600">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
