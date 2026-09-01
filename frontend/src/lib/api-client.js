import axios from 'axios';
import { getAuthToken, getOrCreateGuestSessionId, removeAuthToken } from './session';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Auth token & Guest Session ID
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = getOrCreateGuestSessionId();
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Formatting & 401 Cleanup
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Handle 401 Unauthorized
      if (status === 401) {
        removeAuthToken();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }

      // Format 422 Validation Errors
      if (status === 422 && error.response.data && error.response.data.errors) {
        error.formattedErrors = error.response.data.errors;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
