import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import { HistoryRequest, HistoryResponse, RideSummaryRequest, RideSummaryResponse, CancelScheduledRideRequest, CancelScheduledRideResponse, ModifyScheduledRideRequest, ModifyScheduledRideResponse, RateDriverRequest, RateDriverResponse } from '@/types';

export const fetchRideHistory = async (request: HistoryRequest, signal?: AbortSignal): Promise<HistoryResponse> => {
    const { data } = await apiClient.post<HistoryResponse>(
        API_ENDPOINTS.HISTORY.RIDES,
        request,
        { signal }
    );
    return data;
};

export const fetchRideSummary = async (request: RideSummaryRequest, signal?: AbortSignal): Promise<RideSummaryResponse> => {
    const { data } = await apiClient.post<RideSummaryResponse>(
        API_ENDPOINTS.HISTORY.GET_RIDE_SUMMARY,
        request,
        { signal }
    );
    return data;
};

export const cancelScheduledRide = async (request: CancelScheduledRideRequest, signal?: AbortSignal): Promise<CancelScheduledRideResponse> => {
    const { data } = await apiClient.post<CancelScheduledRideResponse>(
        API_ENDPOINTS.HISTORY.REMOVE_PICKUP_SCHEDULE,
        request,
        { signal }
    );
    return data;
};

export const rateDriver = async (request: RateDriverRequest, signal?: AbortSignal): Promise<RateDriverResponse> => {
    const { data } = await apiClient.post<RateDriverResponse>(
        API_ENDPOINTS.HISTORY.RATE_DRIVER,
        request,
        { signal }
    );
    return data;
};

export const modifyScheduledRide = async (request: ModifyScheduledRideRequest, signal?: AbortSignal): Promise<ModifyScheduledRideResponse> => {
    const { data } = await apiClient.post<ModifyScheduledRideResponse>(
        API_ENDPOINTS.HISTORY.MODIFY_PICKUP_SCHEDULE,
        request,
        { signal }
    );
    return data;
};
