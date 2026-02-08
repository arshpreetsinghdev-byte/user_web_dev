import { useAuthStore } from '@/stores/auth.store';
import { useGeolocation } from './useGeolocation';
import type { GenerateOtpRequest, VerifyOtpRequest } from '@/types';

/**
 * Custom hook to access auth state and actions
 */
export function useAuth() {
  const {
    user,
    token,
    sessionId,
    sessionIdentifier,
    userSessionId,
    userSessionIdentifier,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    generateOtp,
    verifyOtp,
    updateProfile,
    fetchProfile,
    validateSession,
    clearValidationCache,
  } = useAuthStore();

   const { latitude, longitude } = useGeolocation();

  const handleGenerateOtp = async (phoneNumber: string, countryCode: string) => {
    const request: GenerateOtpRequest = {
      latitude: latitude || 0,
      longitude: longitude || 0,
      login_type: 0,
      phone_no: phoneNumber,
      country_code: countryCode,
    };

    return generateOtp(request);
  };

  /**
   * Verify OTP
   */
  const handleVerifyOtp = async (otp: string, phoneNumber: string, countryCode: string) => {
    console.log('🔑 Verifying OTP:', { otp, phoneNumber, countryCode });
  console.log('🌍 Location:', { latitude, longitude });
  
  const request: VerifyOtpRequest = {
    latitude: latitude || 0,
    longitude: longitude || 0,
    login_type: 0,
    phone_no: phoneNumber,
    country_code: countryCode,
    login_otp: otp,
  };
  
  console.log('📤 Verify OTP request:', request);
  return verifyOtp(request);
  };

  /**
   * Update user profile
   */
  const handleUpdateProfile = async (name: string, email: string, imageFile?: File | null) => {
    const requestData: any = {
      updated_user_name: name,
      updated_user_email: email,
    }
    
    if (imageFile) {
      requestData.image_file = imageFile
    }
    
    return updateProfile(requestData);
  };

  const handleFetchProfile = async () => {
    return fetchProfile();
  };

  return {
    user,
    token,
    sessionId,
    sessionIdentifier,
    userSessionId,
    userSessionIdentifier,
    isAuthenticated,
    isLoading,
    error,
    latitude,
    longitude,
    
    // Actions
    login,
    logout,
    updateUser,
    
    // API Actions
    generateOtp: handleGenerateOtp,
    verifyOtp: handleVerifyOtp,
    updateProfile: handleUpdateProfile,
    fetchProfile: handleFetchProfile,
    validateSession,
    clearValidationCache,
  };
}
