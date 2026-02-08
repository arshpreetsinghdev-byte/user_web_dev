import type { PlaceResult } from '@/types';

/**
 * Location data with coordinates and address
 */
export interface BookingLocation {
  latitude: number | null;
  longitude: number | null;
  address: string;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Stop location with unique identifier
 */
export interface StopLocation extends BookingLocation {
  id: number | string;
}

/**
 * Legacy Stop interface for backward compatibility
 */
export interface Stop {
  id: number | string;
  order: number; // index + 1
  latitude: number;
  longitude: number;
  chosen_address: string;
}

/**
 * Complete booking form data
 */
export interface BookingFormData {
  pickup: BookingLocation;
  destination: BookingLocation;
  stops: StopLocation[];
  schedule: string;
  scheduleDateTime?: Date;
}

/**
 * Distance and time calculation result
 */
export interface DistanceTimeResult {
  rideTime: number; // In minutes
  rideDistance: number; // In kilometers
  distanceText: string; // Human readable distance
  durationText: string; // Human readable duration
}

/**
 * Location validation result
 */
export interface LocationValidationResult {
  isValid: boolean;
  errors: {
    pickup?: string;
    destination?: string;
    stops?: { [id: number | string]: string };
  };
}

/**
 * Create empty booking location
 */
export const createEmptyLocation = (): BookingLocation => ({
  latitude: null,
  longitude: null,
  address: '',
  placeId: undefined,
});

/**
 * Create stop location from place result
 */
export const createStopFromPlace = (place: PlaceResult): StopLocation => ({
  id: `stop-${Date.now()}`,
  latitude: place.lat,
  longitude: place.lng,
  address: place.address,
  placeId: place.placeId,
  city: place.city,
  state: place.state,
  country: place.country,
  postalCode: place.postalCode,
});

/**
 * Convert PlaceResult to BookingLocation
 */
export const placeToBookingLocation = (place: PlaceResult): BookingLocation => ({
  latitude: place.lat,
  longitude: place.lng,
  address: place.address,
  placeId: place.placeId,
  city: place.city,
  state: place.state,
  country: place.country,
  postalCode: place.postalCode,
});

/**
 * Check if a location is valid (has coordinates)
 */
export const isValidLocation = (location: BookingLocation | null): boolean => {
  return location !== null && 
         location.latitude !== null && 
         location.longitude !== null && 
         location.address.trim() !== '';
};
