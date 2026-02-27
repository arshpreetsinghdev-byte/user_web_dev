import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { DefaultResponse } from '@/types';
import { fetchOperatorParams, generateHmacHash } from '../utils';
import { headers } from 'next/headers';

interface InitTasksResult {
  serviceAvailable: boolean;
  error?: string;
  googleMapsKey?: string;
  sessionDetails?: any;
  operatorParams?: any;
}

interface BusinessCredentials {
  business_id: number;
  business_token: string;
}

async function fetchBusinessCredentials(subdomain: string): Promise<DefaultResponse & { data?: BusinessCredentials }> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.GET_SUBDOMAIN_ID, {
      subdomain_name: subdomain
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000,
    });
    // console.log("Response ->", response.data.data, response.data.message, response.data); 
    if (response.status === 200 && response.data.flag === 143) {
      return {
        success: true,
        message: response.data.message || 'Success',
        data: response.data.data,
      };
    }

    const errorMsg = response.data.message || 'Failed to fetch business credentials';
    return {
      success: false,
      message: errorMsg,
    };
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to fetch business credentials';
    return {
      success: false,
      message: errorMsg,
    };
  }
}

async function authorizeUser(businessId: number, businessToken: string): Promise<DefaultResponse> {
  try {
    var reqObj = {
      scope: 'open_apis'
    }
    const signature = await generateHmacHash(JSON.stringify(reqObj), businessToken);
    const headers = {
      'x-jugnoo-id': businessId.toString(),
      'x-jugnoo-signature': signature
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.AUTHORIZATION, reqObj, {
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
    const requestHeaders = {
      'x-jugnoo-session-id': sessionDetails.session_id,
      'x-jugnoo-session-identifier': sessionDetails.session_identifier,
    }

    const response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.VERIFY_SESSION, {}, {
      headers: requestHeaders,
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
  // Get hostname from request headers (Next.js server-side)
  const headersList = await headers();
  const hostname = headersList.get('host') || 'unknown';
  
  // Extract subdomain from hostname (e.g., "example-subdomain.example.com" -> "example-subdomain")
  let subdomain = hostname.split('.')[0];
  console.log("Subdomain::",subdomain);
  if(subdomain === 'localhost:4000'){
    subdomain = "magenta-dasik-9633e9"
  }
  // Fetch business credentials before authorizing
  const credentialsResult = await fetchBusinessCredentials(subdomain);
  // console.log("CREDENTIALS RESULT:::::+++",credentialsResult);
  
  if (!credentialsResult.success || !credentialsResult.data) {
    return {
      serviceAvailable: false,
      error: credentialsResult.message || 'Failed to fetch business credentials',
    };
  }
  // const credentialsResult: { data: BusinessCredentials } = {
  //   data: {
  //     business_id: 1001,
  //     business_token: "a5c5432676219e9fd380ac5a28d8ae4ab2b9e1e55cd75617b5c7955ee74d0397"
  //   }
  // };
  const { business_id, business_token } = credentialsResult.data;
  
  const serviceCheck = await authorizeUser(business_id, business_token);

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
    googleMapsKey: getParams.data.map_browser_key,
    sessionDetails: sessionDetails,
    operatorParams: getParams.data,
  };
}
