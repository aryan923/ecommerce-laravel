"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "How do I track my order?",
    answer: "You can track your order status in real time by visiting our Track Order page (/track-order) and entering your tracking number (e.g., TRK-9823471029) or order number."
  },
  {
    question: "What are your standard delivery timeframes?",
    answer: "Standard domestic delivery takes 3–5 business days. Express shipping delivers within 1–2 business days. International orders typically arrive in 7–14 business days depending on customs clearance."
  },
  {
    question: "What is your return & exchange policy?",
    answer: "We offer a 30-day return policy for unused, unwashed items in original packaging with tag attachments. You can initiate a return directly from your Account Dashboard (/account/returns) or contact customer support."
  },
  {
    question: "How do refunds get processed?",
    answer: "Once your returned item is received and inspected at our fulfillment center, refunds are processed to your original payment method or saved refund bank account within 3–5 business days."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, Luxora ships to over 50 countries worldwide. International shipping charges and applicable duties are calculated transparently during checkout."
  },
  {
    question: "How can I modify or cancel my order?",
    answer: "Orders can be canceled or updated within 2 hours of placement via your Customer Account portal (/account/orders). Once an order enters processing or shipment, modifications are no longer possible."
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-stone-700" />
            <span>Frequently Asked Questions</span>
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Quick answers to common questions about shipping, tracking, and returns.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {filteredFaqs.length === 0 ? (
        <div className="text-center py-8 text-stone-500 text-xs">
          No matching FAQ items found for &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="divide-y divide-stone-200 border-t border-b border-stone-200">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-left font-semibold text-stone-900 text-xs sm:text-sm hover:text-stone-700 transition-colors gap-4 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-stone-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-2.5 text-xs text-stone-600 leading-relaxed pr-6">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
