"use client";

import React, { useState } from 'react';
import { User, Lock, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api-client';

export default function ProfileSettingsClient() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || user?.phone_number || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await apiClient.put('/customer/profile', {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });
      const updatedUser = res.data?.data || res.data;
      if (setUser) setUser(updatedUser);
      showToast('Profile information updated successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiClient.post('/customer/change-password', passwordForm);
      showToast('Password changed successfully', 'success');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div data-testid="profile-settings" className="space-y-6">
      <div className="border-b border-stone-200/80 pb-3">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Profile & Security</h1>
        <p className="text-xs text-stone-500 mt-0.5">Manage your personal information and account security password.</p>
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleUpdateProfile} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Personal Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">Full Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">Phone Number</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700">Email Address (Primary)</label>
            <input
              type="email"
              disabled
              value={profileForm.email}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-stone-400">Email address is bound to your account and cannot be changed directly.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Security & Change Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordForm.new_password_confirmation}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300/80 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
