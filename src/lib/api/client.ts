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

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // console.log("apiClient used")
    const { token, sessionId, sessionIdentifier, userSessionId, userSessionIdentifier, isAuthenticated } = useAuthStore.getState();

    // Attach Bearer token if it exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Determine which session to use based on endpoint
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
    const isSystemEndpoint = systemEndpoints.some(endpoint => config.url?.includes(endpoint));
    const isUserEndpoint = userEndpoints.some(endpoint => config.url?.includes(endpoint));

    let activeSessionId = sessionId;
    let activeSessionIdentifier = sessionIdentifier;

    // For user-specific endpoints, enforce user session requirement
    if (isUserEndpoint) {
      if (!userSessionId || !userSessionIdentifier) {
        // console.error('❌ User session required for:', config.url);
        handleSessionExpired();
        throw new axios.Cancel('User session required for this endpoint');
      }
      activeSessionId = userSessionId;
      activeSessionIdentifier = userSessionIdentifier;
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
    if (response.data?.flag === 101) {
      console.warn('⚠️ Session expired (Flag 101) - Logging out');
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

    // Check for session expiration errors
    const errorData = error.response?.data as any;
    const isSessionExpired =
      errorData?.flag === 101 ||
      error.response?.status === 401 ||
      errorData?.message?.toLowerCase().includes('session') ||
      errorData?.error?.toLowerCase().includes('authentication');

    if (isSessionExpired) {
      console.warn('⚠️ Session expired - Logging out');

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

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.USER_DATA);

      // Redirect to login (handle based on your routing)
      if (typeof window !== 'undefined') {
        window.location.href = '/en/home';
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data || error.message || 'An error occurred';

    return Promise.reject(errorMessage);
  }
);

export default apiClient;
