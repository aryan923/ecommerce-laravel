"use client";

import React, { useEffect, useState } from 'react';
import { Building2, Plus, Trash2, ShieldCheck, CheckCircle2, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api-client';

const INITIAL_FORM = {
  account_holder_name: '',
  account_number: '',
  account_number_confirmation: '',
  ifsc_code: '',
  bank_name: '',
};

export default function BankAccountsClient() {
  const { showToast } = useToast();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBankAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/customer/bank-accounts');
      const list = res.data?.data || res.data || [];
      setBankAccounts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Bank accounts fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/customer/bank-accounts/${id}`);
      showToast('Bank account removed', 'info');
      fetchBankAccounts();
    } catch (err) {
      showToast('Failed to remove bank account', 'error');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await apiClient.patch(`/customer/bank-accounts/${id}/default`);
      showToast('Set default refund bank account', 'success');
      fetchBankAccounts();
    } catch (err) {
      showToast('Failed to set default bank account', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.account_number !== formData.account_number_confirmation) {
      showToast('Account numbers do not match', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post('/customer/bank-accounts', {
        account_holder_name: formData.account_holder_name.trim(),
        account_number: formData.account_number.trim(),
        ifsc_code: formData.ifsc_code.trim().toUpperCase(),
        bank_name: formData.bank_name.trim(),
      });
      showToast('Bank account saved for instant refunds', 'success');
      setIsFormOpen(false);
      setFormData(INITIAL_FORM);
      fetchBankAccounts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save bank account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskAccNo = (accNo) => {
    if (!accNo) return '•••• 8492';
    const str = String(accNo);
    if (str.length <= 4) return str;
    return `•••• •••• ${str.substring(str.length - 4)}`;
  };

  return (
    <div data-testid="bank-accounts-management" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Refund Bank Accounts</h1>
          <p className="text-xs text-stone-500 mt-0.5">Save your bank details for automated instant refund processing.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      {/* Add Bank Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-stone-300 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-stone-900 border-b border-stone-100 pb-2">
            Add New Bank Account for Instant Refund
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Account Holder Name</label>
              <input
                type="text"
                required
                value={formData.account_holder_name}
                onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                placeholder="Full name as in bank passbook"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Bank Name</label>
              <input
                type="text"
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="HDFC Bank, ICICI Bank, SBI"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Account Number</label>
              <input
                type="text"
                required
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="9 to 18 digit account number"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Confirm Account Number</label>
              <input
                type="text"
                required
                value={formData.account_number_confirmation}
                onChange={(e) => setFormData({ ...formData, account_number_confirmation: e.target.value })}
                placeholder="Re-enter account number"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-700">IFSC Code</label>
              <input
                type="text"
                required
                maxLength={11}
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                placeholder="11-character IFSC Code (e.g. HDFC0001234)"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-stone-900 text-white text-xs font-extrabold rounded-xl"
            >
              {isSubmitting ? 'Saving...' : 'Save Bank Account'}
            </button>
          </div>
        </form>
      )}

      {/* Bank Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bankAccounts.map((acc) => {
          const isDefault = Boolean(acc.is_default);

          return (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-stone-900">{acc.bank_name || 'Bank Account'}</h3>
                  </div>
                  {isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-emerald-600" /> Default Refund
                    </span>
                  )}
                </div>

                <p className="text-sm font-black text-stone-900 font-mono tracking-wider">
                  {maskAccNo(acc.account_number)}
                </p>
                <p className="text-xs text-stone-600">Holder: <span className="font-bold">{acc.account_holder_name}</span></p>
                <p className="text-[11px] text-stone-400 font-mono">IFSC: {acc.ifsc_code}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                {!isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(acc.id)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Set as Default
                  </button>
                ) : <span />}

                <button
                  type="button"
                  onClick={() => handleDelete(acc.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && bankAccounts.length === 0 && !isFormOpen && (
        <div className="text-center py-10 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
          <ShieldCheck className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-900">No Refund Bank Accounts Saved</h3>
          <p className="text-xs text-stone-500">Save bank account details to enable instant refund processing on returns.</p>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
          >
            Add Bank Account
          </button>
        </div>
      )}
    </div>
  );
}
