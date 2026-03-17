import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export interface FetchConfigurationUserWebRequest {
  latitude: number;
  longitude: number;
}

export interface FetchConfigurationUserWebResponse {
  flag: number;
  message: string;
  currency?: string;
  [key: string]: any;
}

export const fetchConfigurationUserWeb = async (
  data: FetchConfigurationUserWebRequest
): Promise<FetchConfigurationUserWebResponse> => {
  const response = await apiClient.post<FetchConfigurationUserWebResponse>(
    API_ENDPOINTS.AUTH.FETCH_CONFIGURATION_USER_WEB,
    data
  );
  return response.data;
};
