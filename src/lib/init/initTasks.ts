import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { DefaultResponse } from '@/types';
import { fetchOperatorParams, generateHmacHash } from '../utils';

interface InitTasksResult {
  serviceAvailable: boolean;
  error?: string;
  googleMapsKey?: string;
  sessionDetails?: any;
  operatorParams?: any;
}

async function authorizeUser(): Promise<DefaultResponse> {
  try {
    var reqObj = {
        scope : 'open_apis'
    }
    const signature = await generateHmacHash(JSON.stringify(reqObj));
    const headers = {
        'x-jugnoo-id' : API_ENDPOINTS.PRODUCTION.BUSINESS_ID,
        'x-jugnoo-signature' :  signature    
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.AUTHORIZATION,reqObj ,{
      headers,
      timeout: 1000, 
    });

    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || 'Success',
        data: response.data.data,
      };
    }

    const errorMsg = response.data.message || response.data.error || 'Service unavailable';
    return {
      success: false,
      message: errorMsg,
    };
  } catch (error: any) {
    const errorMsg = error.message || 'Service unavailable';
    return {
      success: false,
      message: errorMsg,
    };
  }
}

async function verifySession(sessionDetails: any): Promise<DefaultResponse> {
    try {
        const headers = {
          'x-jugnoo-session-id': sessionDetails.session_id,
          'x-jugnoo-session-identifier': sessionDetails.session_identifier,
        }

        const response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.VERIFY_SESSION, {} ,{
            headers,
            timeout: 5000   
        });
        if (response.status === 200) {
            return {
                success: true,
                message: response.data.message || 'Session verified',
                data: response.data.data,
            };
        }
        const errorMsg = response.data.message || response.data.error || 'Session verification failed';
        return {
            success: false,
            message: errorMsg,
        };
    } catch (error: any) {
        const errorMsg = error.message || 'Session verification failed';
        return {
            success: false,
            message: errorMsg,
        };
    }
}

export async function runInitTasks(): Promise<InitTasksResult> {

  const serviceCheck = await authorizeUser();
  
  if (!serviceCheck.success) {
    return {
      serviceAvailable: false,
      error: serviceCheck.message,
    };
  }

  const sessionDetails = serviceCheck.data;

  const verifySessionResult = await verifySession(sessionDetails);

  if (!verifySessionResult.success) {
    return {
      serviceAvailable: false,
      error: verifySessionResult.message,
    };
  }

  const getParams = await fetchOperatorParams(sessionDetails);
  
  if (!getParams.success) {
    return {
      serviceAvailable: true,
      error: getParams.message,
    };
  }

  return {
    serviceAvailable: true,
    googleMapsKey: getParams.data.map_browser_key || "AIzaSyCMY3bKjonZwiWz4zvEcq189p2_woLcG9U",
    sessionDetails: sessionDetails,
    operatorParams: getParams.data,
  };
}
