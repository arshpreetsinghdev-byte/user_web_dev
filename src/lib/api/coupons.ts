/**
 * Coupons API Service
 * Handles coupon and promotions fetching
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

// ======================== TYPES ========================

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountPercentage: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  isActive?: boolean;
}

export interface CouponsResponse {
  success: boolean;
  coupons: Coupon[];
  message?: string;
}

// ======================== API FUNCTIONS ========================

/**
 * Fetch available coupons and promotions
 */
export const getCouponsPromos = async (): Promise<Coupon[]> => {
  const response = await apiClient.get<CouponsResponse>(API_ENDPOINTS.COUPONS.LIST);
  
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Failed to fetch coupons');
  }
  
  return response.data.coupons ?? [];
};

/**
 * Validate a coupon code
 */
export const validateCoupon = async (code: string): Promise<Coupon | null> => {
  try {
    const response = await apiClient.post<{ success: boolean; coupon: Coupon }>(
      API_ENDPOINTS.COUPONS.VALIDATE,
      { code }
    );
    
    if (response.data?.success && response.data.coupon) {
      return response.data.coupon;
    }
    
    return null;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return null;
  }
};

/**
 * Apply a coupon to the current booking
 */
export const applyCoupon = async (couponId: number, bookingId?: string): Promise<boolean> => {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.COUPONS.APPLY,
      { couponId, bookingId }
    );
    
    return response.data?.success ?? false;
  } catch (error) {
    console.error('Error applying coupon:', error);
    return false;
  }
};
