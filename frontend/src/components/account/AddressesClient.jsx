"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api-client';

const INITIAL_FORM = {
  id: null,
  name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default_shipping: false,
  is_default_billing: false,
};

export default function AddressesClient() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/customer/addresses');
      const list = res.data?.data || res.data || [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Addresses fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenAdd = () => {
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setFormData({
      id: addr.id,
      name: addr.name || addr.full_name || '',
      phone: addr.phone || addr.phone_number || '',
      address_line_1: addr.address_line_1 || '',
      address_line_2: addr.address_line_2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postal_code: addr.postal_code || addr.pincode || '',
      country: addr.country || 'India',
      is_default_shipping: Boolean(addr.is_default_shipping),
      is_default_billing: Boolean(addr.is_default_billing),
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/customer/addresses/${id}`);
      showToast('Address deleted successfully', 'info');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultShipping = async (id) => {
    try {
      await apiClient.patch(`/customer/addresses/${id}/default-shipping`);
      showToast('Set default shipping address', 'success');
      fetchAddresses();
    } catch (err) {
      showToast('Failed to set default shipping address', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await apiClient.put(`/customer/addresses/${formData.id}`, formData);
        showToast('Address updated successfully', 'success');
      } else {
        await apiClient.post('/customer/addresses', formData);
        showToast('Address added successfully', 'success');
      }
      setIsFormOpen(false);
      fetchAddresses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="addresses-management" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Saved Addresses</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage your shipping and billing delivery destinations.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Form Card / Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-stone-300 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-stone-900 border-b border-stone-100 pb-2">
            {formData.id ? 'Edit Saved Address' : 'Add New Address'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-700">Street Address Line 1</label>
              <input
                type="text"
                required
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                placeholder="Flat / House No., Apartment, Street"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-bold text-stone-700">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                placeholder="Landmark, Suite, Unit"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Pincode / Postal Code</label>
              <input
                type="text"
                required
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="400001"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-stone-700">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl"
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
              {isSubmitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => {
          const isDefaultShipping = Boolean(addr.is_default_shipping || addr.is_default);

          return (
            <div
              key={addr.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-stone-900">{addr.name || addr.full_name || 'Shipping Address'}</h3>
                  </div>
                  {isDefaultShipping && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-emerald-600" /> Default Shipping
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {addr.address_line_1} {addr.address_line_2 ? `, ${addr.address_line_2}` : ''}<br />
                  {addr.city}, {addr.state} - {addr.postal_code || addr.pincode}<br />
                  {addr.country || 'India'}
                </p>
                <p className="text-xs text-stone-500 font-medium">Phone: {addr.phone || addr.phone_number}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                {!isDefaultShipping ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultShipping(addr.id)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Set as Default
                  </button>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && addresses.length === 0 && !isFormOpen && (
        <div className="text-center py-10 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
          <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-900">No Saved Addresses Found</h3>
          <p className="text-xs text-stone-500">Add a default shipping address for faster express checkout.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
          >
            Add Address Now
          </button>
        </div>
      )}
    </div>
  );
}
