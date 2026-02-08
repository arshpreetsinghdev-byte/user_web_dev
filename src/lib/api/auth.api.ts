// src/lib/api/auth.api.ts
import { useAuthStore } from '@/stores/auth.store';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';


import {
  GenerateOtpRequest,
  GenerateOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetUserProfileResponse,
} from '@/types';
import { toast } from 'sonner';

/**
 * Generate OTP for customer login
 */
export const generateCustomerLoginOtp = async (
  data: GenerateOtpRequest
): Promise<GenerateOtpResponse> => {
  console.log('📞 Calling generate_customer_login_otp API');
  console.log('📦 Request data:', data);
  console.log('🌐 Endpoint:', API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.GENERATE_CUSTOMER_LOGIN_OTP);

  try {
    const response = await apiClient.post<GenerateOtpResponse>(
      API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.GENERATE_CUSTOMER_LOGIN_OTP,
      data, { timeout: 10000 }
    );

    console.log('✅ OTP API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ OTP API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify customer OTP
 */
export const verifyCustomerOtp = async (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  console.log('🔐 Calling verify_customer_otp API');
  console.log('📦 Request data:', data);

  try {
    const response = await apiClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.VERIFY_CUSTOMER_OTP,
      data
    );

    console.log('✅ Verify OTP Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Verify OTP Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  console.log('👤 Calling update_user_profile API');
  console.log('📦 Request data:', data);
  console.log('📁 Image file:', data.image_file);

  const { userSessionId, userSessionIdentifier } = useAuthStore.getState();
  if (!userSessionId || !userSessionIdentifier) {
    toast.error('User session not found. Please login first.');
  }
  // const headers = {
  //   'x-jugnoo-session-id': userSessionId,
  //   'x-jugnoo-session-identifier': userSessionIdentifier,
  // };

  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('updated_user_name', data.updated_user_name);
    formData.append('updated_user_email', data.updated_user_email);

    // If image file exists, append it
    if (data.image_file) {
      console.log('📤 Appending image file to FormData:', {
        name: data.image_file.name,
        type: data.image_file.type,
        size: data.image_file.size
      });
      formData.append('updated_user_image', data.image_file, data.image_file.name);
    }

    // Log FormData contents
    console.log('📋 FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    const response = await apiClient.post<UpdateProfileResponse>(
      API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.UPDATE_USER_PROFILE,
      formData,
      {
        headers: {
          'x-jugnoo-session-id': userSessionId,
          'x-jugnoo-session-identifier': userSessionIdentifier,
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    console.log('✅ Update Profile Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update Profile Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user profile details
 */
export const getUserProfile = async (): Promise<GetUserProfileResponse> => {
  console.log('👤 Calling get_user_profile_details API');

  const { userSessionId, userSessionIdentifier } = useAuthStore.getState();

  if (!userSessionId || !userSessionIdentifier) {
    throw new Error('User session not found. Please login first.');
  }

  const headers = {
    'x-jugnoo-session-id': userSessionId,
    'x-jugnoo-session-identifier': userSessionIdentifier,
  };
  console.log('headers', headers);
  try {
    const response = await apiClient.post<GetUserProfileResponse>(
      API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.GET_USER_PROFILE,
      {}, // Empty body for POST request
      { headers }
    );

    console.log('✅ Get Profile Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Profile Error:', error.response?.data || error.message);
    throw error;
  }
};