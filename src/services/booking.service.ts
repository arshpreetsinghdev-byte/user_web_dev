import apiClient from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { mapsService } from "@/lib/google-maps/GoogleMapsService";
import type { FindDriversResponse, InsertPickupScheduleResponse } from "@/types";
import { toast } from "sonner";

export interface FetchConfigurationParams {
  latitude: number;
  longitude: number;
}

export interface FetchConfigurationResponse {
  flag?: any;
  data: {
    flag?: any,
    services?: any[];
    currency?: string;
    offset?: number;
  };
}

export interface RouteCalculationParams {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: Array<{ lat: number; lng: number }>;
}

export interface RouteCalculationResult {
  distance: number; // in meters
  duration: number; // in seconds
  distanceText: string;
  durationText: string;
}

export const bookingService = {
  /**
   * Fetch configuration for user web based on pickup location
   */
  async fetchConfiguration(params: FetchConfigurationParams): Promise<FetchConfigurationResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.FETCH_CONFIGURATION_USER_WEB,
      {
        latitude: params.latitude,
        longitude: params.longitude,
      }
    );
    // console.log("config response::", response?.data.flag);
    if(response?.data?.flag === 144){
      toast.error('Selected city is outside the service area');
      return response?.data;
    }
    if (response.data?.data?.services) {
      response.data.data.services = response.data.data.services.filter(
        (s: any) => s.type !== "rental" && s.type !== "car_rental"
      );
    }
    return response.data;
  },

  /**
   * Calculate route with Google Directions API
   */
  async calculateRoute(params: RouteCalculationParams): Promise<RouteCalculationResult | null> {
    try {
      const result = await mapsService.calculateRoute(
        params.origin,
        params.destination,
        params.waypoints
      );
      return result;
    } catch (error) {
      console.error("Error in booking service calculateRoute:", error);
      throw error;
    }
  },

  /**
   * Find available drivers/vehicles for the given route
   */
  async findDrivers(body: URLSearchParams, operatorToken: string): Promise<FindDriversResponse> {
    const response = await apiClient.post<FindDriversResponse>(
      API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.VEHICLE.FIND_DRIVER,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          operator_token: operatorToken,
        },
      }
    );

    return response.data;
  },

  /**
   * Create pickup schedule booking
   */
  async insertPickupSchedule(
    body: URLSearchParams,
    sessionId: string,
    sessionIdentifier: string
  ): Promise<InsertPickupScheduleResponse> {
    const response = await apiClient.post<InsertPickupScheduleResponse>(
      API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.BOOKING.INSERT_PICKUP_SCHEDULE,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-jugnoo-session-id": sessionId,
          "x-jugnoo-session-identifier": sessionIdentifier,
        },
      }
    );

    return response.data;
  },
};
