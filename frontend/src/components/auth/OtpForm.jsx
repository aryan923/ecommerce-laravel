"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function OtpForm({
  email = 'user@example.com',
  type = 'registration',
  onSuccess,
  onChangeEmail,
}) {
  const { verifyOtp, resendOtp, authError, setAuthError } = useAuth();
  const { showToast } = useToast();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [localError, setLocalError] = useState(null);

  const inputRefs = useRef([]);

  // Auto-focus 1st input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 60-second Countdown Timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async (codeToVerify) => {
    const fullCode = typeof codeToVerify === 'string'
      ? codeToVerify
      : inputRefs.current.map((el) => el?.value || '').join('');

    if (fullCode.length !== 6) {
      setLocalError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLocalError(null);
    if (setAuthError) setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await verifyOtp({
        email,
        otp: fullCode,
        type,
      });

      showToast(
        type === 'password_reset'
          ? 'Security code verified successfully!'
          : 'Email address verified! Welcome to Luxora.',
        'success'
      );

      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      const msg =
        err?.message ||
        'Invalid or expired verification code. Please try again.';
      setLocalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (index, value) => {
    // Keep only numeric characters
    const numericVal = value.replace(/\D/g, '');
    if (!numericVal && value !== '') return;

    const char = numericVal.slice(-1); // Take last typed numeric char

    // Build real-time digits array from DOM inputRefs
    const realTimeDigits = inputRefs.current.map((el, i) =>
      i === index ? char : el?.value || ''
    );
    setDigits(realTimeDigits);

    // Auto-advance focus if digit typed and not last box
    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all 6 digits entered
    const filledCode = realTimeDigits.join('');
    if (filledCode.length === 6 && !realTimeDigits.includes('')) {
      handleVerify(filledCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];

      if (newDigits[index]) {
        // Clear current box if filled
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        // Move focus to previous box and clear it
        newDigits[index - 1] = '';
        setDigits(newDigits);
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setLocalError(null);
    if (setAuthError) setAuthError(null);

    const pastedData = e.clipboardData.getData('text').trim();
    const numericData = pastedData.replace(/\D/g, '').slice(0, 6);

    if (numericData.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < numericData.length; i++) {
        newDigits[i] = numericData[i];
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = numericData[i];
        }
      }
      setDigits(newDigits);

      // Focus box after last pasted digit
      const targetIndex = Math.min(numericData.length, 5);
      inputRefs.current[targetIndex]?.focus();

      // Auto-submit if pasted 6 full digits
      if (numericData.length === 6) {
        handleVerify(numericData);
      }
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;

    setIsResending(true);
    setLocalError(null);
    if (setAuthError) setAuthError(null);

    try {
      await resendOtp({ email, type });
      setTimer(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      showToast(`A new verification code has been sent to ${email}`, 'info');
    } catch (err) {
      setLocalError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = digits.join('').length === 6;
  const activeError = localError || authError;

  return (
    <div className="w-full space-y-6">
      {/* Target Email Badge & Notice */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-stone-600 font-medium">
          We sent a 6-digit security code to:
        </p>
        <div className="inline-flex items-center justify-center gap-2 mt-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full">
          <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-wide">
            {email}
          </span>
          {onChangeEmail && (
            <button
              type="button"
              onClick={onChangeEmail}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-900 underline ml-1 cursor-pointer"
            >
              Change
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Banner */}
      {activeError && (
        <div
          data-testid="otp-error-alert"
          className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 shadow-xs"
        >
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold block">Verification Failed</span>
            <span>{activeError}</span>
          </div>
        </div>
      )}

      {/* 6-Digit Segmented Inputs Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              data-testid={`otp-input-${idx}`}
              aria-label={`Digit ${idx + 1} of 6`}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold text-stone-900 bg-white border-2 rounded-xl transition-all outline-none ${
                digit
                  ? 'border-amber-800 bg-amber-50/20 shadow-xs'
                  : 'border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-200'
              } ${activeError ? 'border-red-300 bg-red-50/10' : ''}`}
            />
          ))}
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={!isComplete || isSubmitting}
          data-testid="otp-submit-btn"
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            isComplete && !isSubmitting
              ? 'bg-stone-900 hover:bg-stone-800 text-white hover:shadow-lg active:scale-[0.99]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-stone-400" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </form>

      {/* Resend OTP Section with 60s Countdown Timer */}
      <div className="pt-2 border-t border-stone-100 text-center flex flex-col items-center justify-center gap-1.5">
        <p className="text-xs text-stone-500 font-medium">
          Didn't receive the verification code?
        </p>

        {timer > 0 ? (
          <div
            data-testid="resend-timer-badge"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full"
          >
            <span>Resend code in</span>
            <span className="font-mono font-bold text-amber-900">
              00:{timer < 10 ? `0${timer}` : timer}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            data-testid="resend-otp-btn"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Resending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend Security Code</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
