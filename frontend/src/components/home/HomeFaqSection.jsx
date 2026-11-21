"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: "How fast is shipping and how can I track my order?",
    answer: "We dispatch all orders within 24 hours of confirmation. Standard delivery takes 2 to 4 business days across major cities. You will receive an SMS and email notification with your tracking number, and you can also track your order directly on our site using the Track Order link in the header.",
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer an unconditional 30-day return policy on all eligible items. If you are not completely satisfied with your purchase or require a different size or variant, simply visit your Account > Returns page to generate an instant return request. Our courier partner will pick up the parcel directly from your doorstep.",
  },
  {
    question: "Which payment options do you support?",
    answer: "We accept all major Credit and Debit Cards (Visa, Mastercard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), Netbanking across all Indian banks, and Cash on Delivery (COD) for orders up to ₹10,000.",
  },
  {
    question: "Are your items 100% authentic and covered by warranty?",
    answer: "Yes, every product listed on Luxora is 100% authentic, sourced directly from verified manufacturers and master artisans. Most electronics, watches, and luxury items come with a minimum 1-year manufacturer warranty with warranty registration cards included in the box.",
  },
  {
    question: "How do I apply promotional coupons or discount codes?",
    answer: "You can apply any valid promo code (such as WELCOME20) either inside your Shopping Cart drawer or directly during Step 4 of the Express Checkout process. The discount and exact GST tax breakdown will automatically recalculate in real-time.",
  },
];

export default function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-800" />
            <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
              Got Questions?
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto font-medium">
            Everything you need to know about our shopping experience, delivery, and guarantees.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4 hover:bg-stone-50/60 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-stone-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-[13px] text-stone-600 leading-relaxed border-t border-stone-100">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Support Banner */}
        <div className="bg-[#F5F2EC] border border-stone-300/60 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                Still have a question or need assistance?
              </h4>
              <p className="text-[11px] text-stone-500 font-medium">
                Our support concierge is available 7 days a week to help you.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
