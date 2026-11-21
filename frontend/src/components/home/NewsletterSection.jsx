"use client";

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setIsSubmitted(true);
    showToast('Thank you for subscribing to Luxora Insider!', 'success');
  };

  return (
    <section className="my-14 sm:my-20 lg:my-24">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-[#F5F0E6] via-[#EBE4D6] to-[#E2D8C6] text-stone-950 border border-stone-300/80 rounded-3xl overflow-hidden p-10 sm:p-14 lg:p-18 shadow-xl shadow-stone-900/5">
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-900/10 border border-amber-900/20 text-amber-900 px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase backdrop-blur-md">
              <Mail className="w-3.5 h-3.5 text-amber-800" />
              <span>Join The Insider Club</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight leading-tight">
                Unlock Private Access
              </h2>
              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium max-w-lg mx-auto">
                Subscribe to receive private invitations to new collection drops, exclusive member pricing, and editorial style guides.
              </p>
            </div>

            {/* Subscription Form / Success State */}
            {isSubmitted ? (
              <div className="bg-emerald-900/10 border border-emerald-700/30 rounded-2xl p-6 text-emerald-900 flex items-center justify-center gap-3 max-w-md mx-auto backdrop-blur-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-xs font-bold">You're on the list! Check your inbox shortly for your welcome code.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3.5 text-xs font-medium bg-white/90 border border-stone-300 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-stone-950 hover:bg-amber-800 text-white font-extrabold text-xs py-3.5 px-7 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl active:scale-[0.98] shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Trust Bullet Features */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-stone-600">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-800" />
                <span>No Spam Ever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
                <span>Unsubscribe Anytime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
                <span>100% Secure & Confidential</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
