"use client";

import React from 'react';
import ContactForm from '../../components/contact/ContactForm';
import FaqAccordion from '../../components/contact/FaqAccordion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactClient() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Contact Customer Care
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mx-auto mt-2">
          We are here to assist you with order inquiries, product guidance, and shipping support. Reach out to our concierge team anytime.
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Email Us</h4>
          <p className="text-xs text-stone-600 font-medium">support@luxora.com</p>
          <p className="text-[11px] text-stone-400">Response within 24h</p>
        </div>

        <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-3">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Call Concierge</h4>
          <p className="text-xs text-stone-600 font-medium">+1 (800) 589-6721</p>
          <p className="text-[11px] text-stone-400">Toll-free customer line</p>
        </div>

        <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Headquarters</h4>
          <p className="text-xs text-stone-600 font-medium">123 Fashion Street, Fifth Ave</p>
          <p className="text-[11px] text-stone-400">New York, NY 10001</p>
        </div>

        <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center space-y-2">
          <div className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">Support Hours</h4>
          <p className="text-xs text-stone-600 font-medium">Mon - Fri: 9am - 8pm EST</p>
          <p className="text-[11px] text-stone-400">Sat - Sun: 10am - 5pm EST</p>
        </div>
      </div>

      {/* Main Content Layout (Form + FAQ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ContactForm />
        <FaqAccordion />
      </div>
    </div>
  );
}
