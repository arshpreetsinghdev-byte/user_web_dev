import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '@/lib/utils/storage';
import { STORAGE_KEYS, API_TIMEOUT } from '@/lib/utils/constants';
import { useAuthStore } from '@/stores/auth.store';
import { BASE_URL } from '@/lib/api/endpoints';
import { useUIStore } from '@/stores/ui.store';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleSessionExpired = () => {
  storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  storage.remove(STORAGE_KEYS.USER_DATA);
  useAuthStore.getState().logout();

  if (typeof window !== 'undefined') {
    // Open login modal instead of redirecting
    useUIStore.getState().openAuthModal('login');

    // Only redirect if not already on home page
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/home') && !currentPath.includes('/book')) {
      window.location.href = '/en/home';
    }
  }
};
// System endpoints always use generic/operator session
const systemEndpoints = [
  '/open/v1/authorization',
  '/open/v1/verify_session',
  '/open/v1/fetch_operator_params',
  '/open/v1/fetch_configuration_user_web',
  '/open/v1/generate_customer_login_otp',
  '/open/v1/verify_customer_otp',
  // Removed '/open/v1/find_a_driver' - should use user session when authenticated

  '/open/v1/add_card_3d',
  '/open/v1/confirm_card_3d',
  '/open/v1/delete_card',
];

// User-specific endpoints that REQUIRE user session
const userEndpoints = [
  '/open/v1/get_user_profile',
  '/open/v1/update_user_profile',
  '/open/v1/insert_pickup_schedule',
  '/open/v1/add_sqaure_card',
  '/open/v1/fetch_wallet_balance',
];

//edit for gitlab-it
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("apiClient used")
    const { token, sessionId, sessionIdentifier, userSessionId, userSessionIdentifier, isAuthenticated, isHydrated } = useAuthStore.getState();

    // Attach Bearer token if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isSystemEndpoint = systemEndpoints.some(endpoint => config.url?.includes(endpoint));
    const isUserEndpoint = userEndpoints.some(endpoint => config.url?.includes(endpoint));

    let activeSessionId = sessionId;
    let activeSessionIdentifier = sessionIdentifier;

    // For user-specific endpoints, enforce user session requirement
    // BUT only after the store has hydrated (prevents logout on page refresh)
    if (isUserEndpoint) {
      if (!userSessionId || !userSessionIdentifier) {
        // Only enforce strict check AFTER hydration is complete
        if (isHydrated) {
          console.error('❌ User session required for:', config.url);
          handleSessionExpired();
          throw new axios.Cancel('User session required for this endpoint');
        } else {
          // During hydration, allow the request to proceed with system session
          console.warn('⚠️ Store not hydrated yet, using system session temporarily for:', config.url);
          // Will use fallback to system session below
        }
      } else {
        activeSessionId = userSessionId;
        activeSessionIdentifier = userSessionIdentifier;
      }
    }
    // For system endpoints, always use system session
    else if (isSystemEndpoint) {
      activeSessionId = sessionId;
      activeSessionIdentifier = sessionIdentifier;
    }
    // For other endpoints, prefer user session if available, fallback to system session
    else if (userSessionId && userSessionIdentifier) {
      activeSessionId = userSessionId;
      activeSessionIdentifier = userSessionIdentifier;
    }

    if (activeSessionId && activeSessionIdentifier && config.headers) {
      config.headers['x-jugnoo-session-id'] = activeSessionId;
      config.headers['x-jugnoo-session-identifier'] = activeSessionIdentifier;
      console.log('📡 Using session:', isUserEndpoint ? 'USER' : isSystemEndpoint ? 'SYSTEM' : 'AUTO', config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Check for session expiration in successful responses (Flag 101)
    // Only logout for non-system endpoints — system session errors should NOT destroy user session
    if (response.data?.flag === 101) {
      const requestUrl = response.config?.url || '';
      const isSystemRequest = systemEndpoints.some(ep => requestUrl.includes(ep));

      if (isSystemRequest) {
        console.warn('⚠️ System session expired (Flag 101) - NOT logging out user');
        return Promise.reject(new Error('System session expired.'));
      }

      console.warn('⚠️ User session expired (Flag 101) - Logging out');
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_DATA);
      useAuthStore.getState().logout();

      if (typeof window !== 'undefined') {
        window.location.href = '/en/home';
      }
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    return response;
  },
  (error: AxiosError) => {
    // Check for cancellation first
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const requestUrl = error.config?.url || '';
    const isSystemRequest = systemEndpoints.some(ep => requestUrl.includes(ep));

    // Check for session expiration errors — only use precise flag/status checks
    const errorData = error.response?.data as any;
    const isSessionExpired =
      errorData?.flag === 101 ||
      error.response?.status === 401;

    if (isSessionExpired) {
      // System endpoint failure should NOT destroy user session
      if (isSystemRequest) {
        console.warn('⚠️ System endpoint session error - NOT logging out user:', requestUrl);
        return Promise.reject(error.response?.data || error.message || 'System session error');
      }

      console.warn('⚠️ User session expired - Logging out');

      // Clear auth storage
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_DATA);
      useAuthStore.getState().logout();

      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/en/home';
      }

      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle other errors
    const errorMessage = error.response?.data || error.message || 'An error occurred';

    return Promise.reject(errorMessage);
  }
);

export default apiClient;
