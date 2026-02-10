import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { User } from '@/types';
import { useUIStore } from './ui.store';
import {
  generateCustomerLoginOtp,
  verifyCustomerOtp,
  updateUserProfile,
  getUserProfile,
} from '@/lib/api/auth.api';
import { toast } from 'sonner';
import type {
  GenerateOtpRequest,
  VerifyOtpRequest,
  UpdateProfileRequest,
  VerifyOtpResponse,
  GetUserProfileResponse,
  UpdateProfileResponse,
} from '@/types';

// Session validation cache to prevent excessive API calls
let lastValidationTime = 0;
const VALIDATION_CACHE_DURATION = 5 * 60 * 1000; // 30 seconds

interface AuthState {
  user: User | null;
  token: string | null;
  phone_no?: string;
  sessionId: string | null; // Global session from runInitTasks - never cleared
  sessionIdentifier: string | null; // Global session from runInitTasks - never cleared
  userSessionId: string | null; // User-specific session from login - cleared on logout
  userSessionIdentifier: string | null; // User-specific session from login - cleared on logout
  isAuthenticated: boolean;
  user_image: string | null;
  isLoading: boolean;
  error: string | null;
  verifyOtp: (data: VerifyOtpRequest) => Promise<VerifyOtpResponse>;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setSession: (sessionId: string, sessionIdentifier: string) => void; // For global session
  setUserSession: (sessionId: string, sessionIdentifier: string) => void; // For user session after login
  clearSession: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;

  generateOtp: (data: GenerateOtpRequest) => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
  fetchProfile: () => Promise<GetUserProfileResponse>;
  validateSession: () => Promise<boolean>;
  clearValidationCache: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        sessionId: null,
        sessionIdentifier: null,
        userSessionId: null,
        userSessionIdentifier: null,
        isAuthenticated: false,
        user_image: null,
        isLoading: false,
        error: null,

        setUser: (user) =>
          set({ user, isAuthenticated: true }, false, 'auth/setUser'),

        setToken: (token) =>
          set({ token }, false, 'auth/setToken'),

        setSession: (sessionId, sessionIdentifier) =>
          set(
            { sessionId, sessionIdentifier },
            false,
            'auth/setSession'
          ),

        setUserSession: (userSessionId, userSessionIdentifier) =>
          set(
            { userSessionId, userSessionIdentifier },
            false,
            'auth/setUserSession'
          ),

        clearSession: () =>
          set(
            { sessionId: null, sessionIdentifier: null },
            false,
            'auth/clearSession'
          ),

        login: (user, token) =>
          set(
            { user, token, isAuthenticated: true },
            false,
            'auth/login'
          ),

        logout: () => {
          lastValidationTime = 0; // Clear validation cache on logout
          set(
            {
              user: null,
              token: null,
              userSessionId: null, // Only clear USER session
              userSessionIdentifier: null, // Only clear USER session
              isAuthenticated: false
              // sessionId and sessionIdentifier remain intact!
            },
            false,
            'auth/logout'
          );
        },

        updateUser: (userData) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...userData } : null,
            }),
            false,
            'auth/updateUser'
          ),

        generateOtp: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const currentState = useAuthStore.getState();
            console.log('🔍 Current session in store before generateOtp:', {
              sessionId: currentState.sessionId,
              sessionIdentifier: currentState.sessionIdentifier
            });
            const response = await generateCustomerLoginOtp(data);
            console.log('📩 Generate OTP Response:', response);
            if (response.flag === 143) {
              set({
                isLoading: false,
                error: null,
              });
            } else {
              throw new Error(response.message || 'Failed to generate OTP');
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to generate OTP',
            });
            throw error;
          }
        },

        verifyOtp: async (data): Promise<VerifyOtpResponse> => {
          set({ isLoading: true, error: null });
          try {
            const response = await verifyCustomerOtp(data);

            console.log('🔐 Verify OTP Response:', response);

            if (response.flag === 143) {
              // Extract from top level or from data object (defensive)
              const newUserSessionId = response.session_id || response.data?.session_id;
              const newUserSessionIdentifier = response.session_identifier || response.data?.session_identifier;
              const userIdentifier = response.user_identifier || response.data?.user_identifier;
              const user = response.user || response.data?.user;
              const token = response.access_token || response.data?.access_token;
              const signupOnboarding = response.signup_onboarding ?? response.data?.signup_onboarding;

              console.log('✅ OTP Verified - Final session used:', {
                newUserSessionId,
                newUserSessionIdentifier,
                userIdentifier
              });

              if (signupOnboarding === 1) {
                console.log('⏸️ Onboarding required - deferring authentication');
                set({
                  // ONLY store in user session, DON'T overwrite global sessionId
                  userSessionId: newUserSessionId,
                  userSessionIdentifier: newUserSessionIdentifier,
                  user: user || null,
                  token: token || null,
                  isAuthenticated: false, // DON'T authenticate yet
                  isLoading: false,
                  error: null,
                });
              } else {
                set({
                  // ONLY store in user session, DON'T overwrite global sessionId
                  userSessionId: newUserSessionId,
                  userSessionIdentifier: newUserSessionIdentifier,
                  user: user || null,
                  token: token || null,
                  isAuthenticated: true, // Authenticate now
                  isLoading: false,
                  error: null,
                });
              }

              return response;
            } else {
              throw new Error(response.message || 'Failed to verify OTP');
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to verify OTP',
            });
            throw error;
          }
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null });
          try {
            const response = await updateUserProfile(data);

            if (response.flag === 143) {
              const currentState = useAuthStore.getState();

              // If image was uploaded and response contains the URL, update it
              const updatedUser: any = {
                name: data.updated_user_name,
                email: data.updated_user_email,
              };

              // If we have the image URL from response, add it
              if (response.data?.user_image) {
                updatedUser.user_image = response.data.user_image;
              }

              // Success - update user in store
              set((state) => ({
                user: state.user
                  ? {
                    ...state.user,
                    ...updatedUser,
                  }
                  : null,
                isAuthenticated: currentState.userSessionId ? true : state.isAuthenticated,
              }));
            } else if (response.flag === 144) {
              console.warn('⚠️ Profile update warning:', response.message);
              set({ isLoading: false, error: response.error || response.message });
            } else {
              throw new Error(response.error || response.message || 'Failed to update profile');
            }
            return response;
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to update profile',
            });
            throw error;
          }
        },
        fetchProfile: async (): Promise<GetUserProfileResponse> => {
          set({ isLoading: true, error: null });
          try {
            const response = await getUserProfile();

            console.log('📥 Fetch Profile Response:', response);

            if (response.flag === 143 && response.data) {
              const profileData = response.data;

              // Update user in store with fetched profile data
              set((state) => ({
                user: {
                  user_id: profileData.user_id || state.user?.user_id || '', // Keep existing ID or use empty string
                  name: profileData.user_name || state.user?.name || '',
                  email: profileData.user_email || state.user?.email || '',
                  phone_no: profileData.phone_no || state.user?.phone_no || '',
                  user_image: profileData.user_image || state.user?.user_image || '',
                  createdAt: state.user?.createdAt || '',
                  updatedAt: new Date().toISOString(),
                },
                isLoading: false,
                error: null,
              }));

              console.log('✅ Profile updated in store');
              return response;
            } else if (response.flag === 101) {
              console.warn('⚠️ Authentication failed (Flag 101) - Logging out');
              toast.error('Your session has expired. Please login again.');
              get().logout(); // Auto logout on session expiration
              if (typeof window !== 'undefined') {
                useUIStore.getState().openAuthModal('login');
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/home') && !currentPath.includes('/book')) {
                  window.location.href = '/en/home';
                }
              }
              const errorMsg = response.message || response.error || 'Session expired. Please login again.';
              throw new Error(errorMsg);
            } else {
              throw new Error(response.error || response.message || 'Failed to fetch profile');
            }
          } catch (error: any) {
            console.error('❌ Fetch Profile Error:', error);
            set({
              isLoading: false,
              error: error.message || 'Failed to fetch profile',
            });
            throw error;
          }
        },

        validateSession: async (): Promise<boolean> => {
          const state = get();

          // If not authenticated, no need to validate
          if (!state.isAuthenticated || !state.userSessionId || !state.userSessionIdentifier) {
            return false;
          }

          const now = Date.now();

          // Use cached result if validation was recent (prevents excessive API calls)
          if (now - lastValidationTime < VALIDATION_CACHE_DURATION) {
            console.log('✅ Using cached session validation');
            return true;
          }

          try {
            console.log('🔍 Validating user session...');
            const response = await getUserProfile();

            if (response.flag === 143) {
              console.log('✅ Session is valid');
              lastValidationTime = now;
              return true;
            } else if (response.flag === 101) {
              console.warn('⚠️ Session expired (Flag 101) - Logging out');
              toast.error('Your session has expired. Please login again.');
              get().logout();
              if (typeof window !== 'undefined') {
                useUIStore.getState().openAuthModal('login');
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/home') && !currentPath.includes('/book')) {
                  window.location.href = '/en/home';
                }
              }
              return false;
            } else {
              console.warn('⚠️ Session validation failed:', response.message);
              return false;
            }
          } catch (error: any) {
            console.error('❌ Session validation error:', error);

            // If authentication error, logout
            if (error.response?.data?.flag === 101 ||
              error.message?.toLowerCase().includes('authentication') ||
              error.message?.toLowerCase().includes('session')) {
              console.warn('⚠️ Session error detected - Logging out');
              toast.error('Your session has expired. Please login again.');
              get().logout();
              if (typeof window !== 'undefined') {
                useUIStore.getState().openAuthModal('login');
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/home') && !currentPath.includes('/book')) {
                  window.location.href = '/en/home';
                }
              }
              return false;
            }

            return false;
          }
        },

        clearValidationCache: () => {
          lastValidationTime = 0;
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          sessionId: state.sessionId, // Global session - persisted
          sessionIdentifier: state.sessionIdentifier, // Global session - persisted
          userSessionId: state.userSessionId, // User session - persisted
          userSessionIdentifier: state.userSessionIdentifier, // User session - persisted
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);