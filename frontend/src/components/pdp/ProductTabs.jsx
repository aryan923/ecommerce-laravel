"use client";

import React, { useState } from 'react';
import { FileText, SlidersHorizontal, ShieldCheck, Star } from 'lucide-react';
import ReviewList from './ReviewList';

export default function ProductTabs({ product = {} }) {
  const [activeTab, setActiveTab] = useState('description');

  const specifications = product.specifications || product.specs || [
    { label: 'Material', value: product.material || 'Premium Aluminum / Composite' },
    { label: 'Dimensions', value: product.dimensions || '14.5 x 8.2 x 2.1 cm' },
    { label: 'Weight', value: product.weight || '340g' },
    { label: 'Warranty', value: product.warranty || '2 Years Manufacturer Warranty' },
    { label: 'Country of Origin', value: product.country_of_origin || 'Imported' },
  ];

  const specList = Array.isArray(specifications)
    ? specifications
    : Object.entries(specifications).map(([key, val]) => ({ label: key, value: String(val) }));

  const tabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'specifications', label: 'Specifications', icon: SlidersHorizontal },
    { id: 'shipping', label: 'Shipping & Returns', icon: ShieldCheck },
    { id: 'reviews', label: `Reviews (${product.reviews_count || 18})`, icon: Star },
  ];

  return (
    <div data-testid="product-tabs" className="flex flex-col gap-6 my-12 border-t border-stone-200/80 pt-10">
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-200/80 pb-px scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              data-testid="tab-button"
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'border-amber-700 text-amber-900 bg-amber-50/50 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-t-xl'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div data-testid="tab-content" className="py-2">
        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed flex flex-col gap-4">
            <p>
              {product.description ||
                product.long_description ||
                'Experience unparalleled craftmanship and performance with this premium selection. Designed with precision, this product delivers exceptional value, durability, and elegance tailored for your daily needs.'}
            </p>
            {product.features && Array.isArray(product.features) && (
              <div className="mt-4">
                <h4 className="text-sm font-bold text-stone-900 mb-2">Key Highlights & Features:</h4>
                <ul className="list-disc pl-5 flex flex-col gap-1.5 text-stone-600">
                  {product.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specifications' && (
          <div className="overflow-hidden border border-stone-200/80 rounded-2xl max-w-2xl">
            <table className="w-full text-xs sm:text-sm text-left">
              <tbody>
                {specList.map((spec, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-stone-50/60' : 'bg-white'}
                  >
                    <td className="px-5 py-3 font-bold text-stone-900 w-1/3 border-b border-stone-100">
                      {spec.label}
                    </td>
                    <td className="px-5 py-3 text-stone-600 border-b border-stone-100">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Shipping & Returns */}
        {activeTab === 'shipping' && (
          <div className="flex flex-col gap-4 text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
            <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col gap-1">
              <h4 className="font-bold text-stone-900 text-sm">Standard Shipping SLA</h4>
              <p>Orders placed before 2:00 PM EST are processed on the same business day. Standard transit time is 3 to 5 business days nationwide.</p>
            </div>
            <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col gap-1">
              <h4 className="font-bold text-stone-900 text-sm">Hassle-Free 30-Day Returns</h4>
              <p>If you are not 100% satisfied with your purchase, return it within 30 days of delivery in unused condition with original packaging for a full refund or exchange.</p>
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <ReviewList productId={product.id} initialReviews={product.reviews || []} />
        )}
      </div>
    </div>
  );
}
