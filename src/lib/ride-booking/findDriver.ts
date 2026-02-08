/**
 * Find Driver API Service
 * Handles vehicle discovery and fare estimation
 */

import { bookingService } from '@/services/booking.service';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { BookingLocation, DistanceTimeResult } from '@/components/booking/types';
import type {
  VehicleRegion,
  FindDriverOptions,
  InsertPickupScheduleRequest,
  InsertPickupScheduleResponse,
  FindDriversResponse,
} from '@/types';
import {
  formatDateTime,
  getCookieValue,
  buildInsertPickupScheduleBody,
} from '@/lib/utils/helpers';
import { toast } from 'sonner';

// ======================== API FUNCTIONS ========================

/**
 * Find available drivers/vehicles for the given route
 */
export const findAvailableDrivers = async (
  pickup: BookingLocation,
  dropoff: BookingLocation,
  distanceTime: DistanceTimeResult,
  options: FindDriverOptions = {}
): Promise<FindDriversResponse> => {
  // Validate locations
  if (!pickup.latitude || !pickup.longitude) {
    throw new Error('Invalid pickup location');
  }

  if (!dropoff.latitude || !dropoff.longitude) {
    throw new Error('Invalid destination location');
  }

  const operatorToken = getCookieValue('jugnoo_operator_token') ?? API_ENDPOINTS.PRODUCTION.BUSINESS_TOKEN;

  const body = new URLSearchParams();
  body.set('latitude', String(pickup.latitude));
  body.set('longitude', String(pickup.longitude));
  body.set('op_drop_latitude', String(dropoff.latitude));
  body.set('op_drop_longitude', String(dropoff.longitude));
  body.set('ride_time', String(distanceTime.rideTime));
  body.set('ride_distance', String(distanceTime.rideDistance));
  body.set('login_type', '0');
  body.set('show_toll_charge', '1');

  // Add service ID if provided
  if (options.serviceId) {
    body.set('service_id', String(options.serviceId));
  }

  // Add round trip details if applicable
  if (options.isRoundTrip && options.returnDateTime) {
    body.set('return_trip', '1');
    body.set('return_time', formatDateTime(options.returnDateTime, options.timezoneOffset));
    body.set('ride_time', String(distanceTime.rideTime * 2));
    body.set('ride_distance', String(distanceTime.rideDistance * 2));
  }

  // Add pickup time for scheduled rides
  if (options.scheduledFareFlow && options.rideDateTime) {
    body.set('pickup_time', formatDateTime(options.rideDateTime, options.timezoneOffset));
  }

  try {
    console.log('🚗 Finding drivers (form)...', Object.fromEntries(body.entries()));

    const data = await bookingService.findDrivers(body, operatorToken);
    console.log('🚗 Find drivers response:', data );
    // Check for success (flag 175)
    if (data.flag === 175) {
      console.log('✅ Drivers found:', data?.regions || 0);
      return data;
    } else {
      throw new Error('Failed to find drivers');
    }
  } catch (error: any) {  
    console.error('❌ Find driver error:', error);
    throw new Error(error.message || 'Failed to find available vehicles');
  }
};

/**
 * Filter vehicles by supported ride types
 */
export const filterVehiclesByRideType = (
  vehicles: VehicleRegion[],
  supportedRideTypes: number[]
): VehicleRegion[] => {
  if (!supportedRideTypes?.length) {
    return vehicles;
  }

  const allowed = supportedRideTypes
    .map((rt) => Number(rt))
    .filter((rt) => !Number.isNaN(rt));

  if (!allowed.length) {
    return vehicles;
  }

  return vehicles.filter((vehicle) => allowed.includes(Number(vehicle.ride_type)));
};

/**
 * Sort vehicles by fare (lowest first)
 */
export const sortVehiclesByFare = (
  vehicles: VehicleRegion[],
  ascending = true
): VehicleRegion[] => {
  return [...vehicles].sort((a, b) => {
    const fareA = a.region_fare?.fare_float || a.region_fare.fare;
    const fareB = b.region_fare?.fare_float || b.region_fare.fare;
    return ascending ? fareA - fareB : fareB - fareA;
  });
};

/**
 * Sort vehicles by ETA (fastest first)
 */
export const sortVehiclesByETA = (vehicles: VehicleRegion[]): VehicleRegion[] => {
  return [...vehicles].sort((a, b) => {
    const etaA = a.eta || Infinity;
    const etaB = b.eta || Infinity;
    return etaA - etaB;
  });
};

export { getFormattedFare, getFormattedETA } from '@/lib/utils/helpers';
export type {
  VehicleRegion,
  VehicleService,
  RegionFare,
  FindDriverRequest,
  FindDriversResponse,
  FindDriverOptions,
} from '@/types';

/**
 * Create pickup schedule booking via insert_pickup_schedule
 */
export const insertPickupSchedule = async (
  payload: InsertPickupScheduleRequest
): Promise<InsertPickupScheduleResponse> => {
  const body = buildInsertPickupScheduleBody(payload);

  const data = await bookingService.insertPickupSchedule(
    body,
    payload.sessionId,
    payload.sessionIdentifier
  );

  if (data.flag === 175 || data.flag === 143) {
    return data;
  }

  throw new Error(data.message || 'Failed to schedule pickup');
};
