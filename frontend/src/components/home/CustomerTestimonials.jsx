"use client";

import React from 'react';
import { Star, CheckCircle, Quote, ThumbsUp } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Ananya Roy',
    city: 'Bengaluru, KA',
    verified: true,
    rating: 5,
    title: 'Exceeded all expectations of quality',
    comment: 'The craftsmanship and packaging are exceptional. You can genuinely feel the premium texture and attention to detail. Delivery was smooth, arriving in just 2 days.',
    productName: 'Raw Linen Relaxed Overshirt',
    date: '3 days ago',
  },
  {
    id: 2,
    name: 'Vikram Sharma',
    city: 'Mumbai, MH',
    verified: true,
    rating: 5,
    title: 'A masterclass in modern minimalist design',
    comment: 'I was hesitant about ordering luxury accessories online, but the Chronograph Watch exceeded what I see in physical high-end boutiques. Flawless finish and great weight.',
    productName: 'Artisan Chronograph Watch Edition V',
    date: '1 week ago',
  },
  {
    id: 3,
    name: 'Meera Deshmukh',
    city: 'Pune, MH',
    verified: true,
    rating: 5,
    title: 'Customer support is truly world-class',
    comment: 'Had a question regarding variant sizing and received an instant, thoughtful response from support. The return process was completely frictionless when changing sizes.',
    productName: 'Minimalist Leather Bag',
    date: '2 weeks ago',
  },
];

export default function CustomerTestimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-1">
            <ThumbsUp className="w-3 h-3 text-amber-800" />
            <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
              Social Proof & Reviews
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
            Loved By Thousands of Shoppers
          </h2>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <span className="text-xs font-extrabold text-stone-800">
              4.9 / 5 Overall Satisfaction (Over 12,500+ Verified Orders)
            </span>
          </div>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="flex flex-col justify-between bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
            >
              <div className="space-y-3">
                {/* Star Rating & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                {/* Review Title & Body */}
                <h4 className="font-bold text-sm text-stone-900 tracking-tight">
                  "{review.title}"
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {review.comment}
                </p>
              </div>

              {/* Reviewer Details Footer */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-stone-900">
                    {review.name}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium">
                    {review.city} • {review.date}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg max-w-[130px] truncate">
                    {review.productName}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
