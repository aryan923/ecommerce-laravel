"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api-client';
import { getAuthToken, setAuthToken, removeAuthToken } from '../lib/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setTokenState(storedToken);
      const res = await apiClient.get('/auth/me');
      if (res.data && res.data.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      removeAuthToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setTokenState(null);
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
      };
    }
  }, [checkAuth]);

  const login = async (credentials) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', credentials);
      const responseData = res.data.data || res.data;
      const newToken = responseData.token || responseData.access_token;
      const userData = responseData.user || responseData;

      if (newToken) {
        setAuthToken(newToken);
        setTokenState(newToken);
        setUser(userData);

        // Merge Guest Cart into User Account Cart
        try {
          await apiClient.post('/cart/merge');
        } catch (mergeErr) {
          console.warn('Cart merge notice:', mergeErr);
        }
      }
      return responseData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password credentials.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', userData);
      const responseData = res.data.data || res.data;
      const newToken = responseData.token || responseData.access_token;
      const newUser = responseData.user || responseData;

      if (newToken) {
        setAuthToken(newToken);
        setTokenState(newToken);
        setUser(newUser);

        // Merge Guest Cart into User Account Cart
        try {
          await apiClient.post('/cart/merge');
        } catch (mergeErr) {
          console.warn('Cart merge notice:', mergeErr);
        }
      }
      return responseData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to send password reset email.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (payload) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/reset-password', payload);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      removeAuthToken();
      setTokenState(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authError,
        setAuthError,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
