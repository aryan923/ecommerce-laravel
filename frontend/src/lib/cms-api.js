import axios from 'axios';
import apiClient from './api-client';

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_BASE_URL || 'http://ecom-panel-app/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002/api/v1';
}

/**
 * Fetch active storefront banners by placement.
 */
export async function fetchBanners(placement = null) {
  const baseURL = getApiBaseUrl();
  const params = placement ? { placement } : {};

  try {
    const response = await axios.get(`${baseURL}/banners`, { params, timeout: 5000 });
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    if (typeof window === 'undefined' && !error.response) {
      try {
        const fallbackRes = await axios.get(`http://localhost:8002/api/v1/banners`, { params, timeout: 2000 });
        if (fallbackRes.data && fallbackRes.data.success) {
          return fallbackRes.data.data || [];
        }
      } catch (e) {
        // ignore
      }
    }
    return [];
  }
}

/**
 * Fetch published CMS page details by slug.
 */
export async function fetchPageBySlug(slug) {
  const baseURL = getApiBaseUrl();

  try {
    const response = await axios.get(`${baseURL}/pages/${slug}`, { timeout: 5000 });
    if (response.data && response.data.success) {
      return response.data.data || null;
    }
    return null;
  } catch (error) {
    if (typeof window === 'undefined' && !error.response) {
      try {
        const fallbackRes = await axios.get(`http://localhost:8002/api/v1/pages/${slug}`, { timeout: 2000 });
        if (fallbackRes.data && fallbackRes.data.success) {
          return fallbackRes.data.data || null;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  }
}
