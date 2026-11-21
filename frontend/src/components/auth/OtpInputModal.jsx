"use client";

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import OtpForm from './OtpForm';

export default function OtpInputModal({
  isOpen = false,
  onClose,
  email = 'user@example.com',
  type = 'registration',
  onSuccess,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 overflow-hidden">
        {/* Close Modal Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            data-testid="close-otp-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Security Verification
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Please enter the 6-digit passcode sent to your device.
          </p>
        </div>

        {/* Embedded OTP Form */}
        <OtpForm
          email={email}
          type={type}
          onSuccess={(res) => {
            if (onSuccess) onSuccess(res);
            if (onClose) onClose();
          }}
          onChangeEmail={onClose}
        />
      </div>
    </div>
  );
}
