/**
 * Session & Cookie Management Utilities for Frontend Application
 */

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function setCookie(name, value, days = 30) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
}

export function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
}

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateGuestSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = getCookie('guest_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    setCookie('guest_session_id', sessionId, 30);
  }
  return sessionId;
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return getCookie('auth_token') || localStorage.getItem('auth_token') || null;
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    setCookie('auth_token', token, 30);
    localStorage.setItem('auth_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window === 'undefined') return;
  removeCookie('auth_token');
  localStorage.removeItem('auth_token');
}
