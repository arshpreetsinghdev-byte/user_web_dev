import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_ENDPOINTS } from "./api/endpoints";
import { DefaultResponse } from "@/types";
import apiClient from "./api/client";
import { useOperatorParamsStore } from "./operatorParamsStore";
const { setData } = useOperatorParamsStore.getState();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserWebConfig(raw: any) {
  try {
    if (!raw) return {};

    let cleaned = raw.trim();

    // 1) Remove wrapping backticks `
    if (cleaned.startsWith("`") && cleaned.endsWith("`")) {
      cleaned = cleaned.slice(1, -1);
    }

    // 2) Remove wrapping single quotes '
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.slice(1, -1);
    }

    // 3) Parse JSON
    // console.log('Parsed user_web_config:', JSON.parse(cleaned));
    return JSON.parse(cleaned);

  } catch (err) {
    console.error("Failed to parse user_web_config:", err);
    return {};
  }
}

export async function generateHmacHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(API_ENDPOINTS.PRODUCTION.BUSINESS_TOKEN);
  const dataBuffer = encoder.encode(data);

  try {
    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);

    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('HMAC generation failed:', error);
    throw new Error('Failed to generate HMAC hash');
  }
}

export async function fetchOperatorParams(sessionDetails: any): Promise<DefaultResponse> {
  try {
    var reqObj = {
      param_names: ['user_web_config','map_browser_key', 'autos_panel_theme', 'default_country_code', 'default_country_iso', 'show_operator_logo_on_panel'],
      get_operator_data: 1,
    }

    const headers = {
      'x-jugnoo-session-id': sessionDetails.session_id,
      'x-jugnoo-session-identifier': sessionDetails.session_identifier,
    }
    let response;
    // console.log("headers fetchOperatorParams", headers);
    try {
      response = await apiClient.post(API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL + API_ENDPOINTS.AUTH.FETCH_OPERATOR_PARAMS, reqObj, {
        headers,
        timeout: 5000,
      });
    }
    catch (error) {
      console.log("error fetchOperatorParams", error);
    }
    // console.log("response fetchOperatorParams", response?.data.data.autos_panel_theme);


  // console.log('Fetch operator params response:', response?.data.data);
    if (response?.status === 200) {
      const data = response?.data.data;
      
      // Parse user_web_config if it exists
      if (data.user_web_config) {
        const parsedConfig = getUserWebConfig(data.user_web_config);
        console.log("Parsed Config:::", parsedConfig);
        data.user_web_config = parsedConfig;
      }
      
      // Store the operator params data
      setData(data);
      return {
        success: true,
        message: 'Fetched operator params',
        data: data,
      };
    } 

    return {
      success: false,
      message: 'Fetch operator params returned unexpected status',
    };

  } catch (error: any) {
    console.error('❌ Fetch operator params failed:', error.message);
    const errorMsg = error.message || 'Fetch operator params failed';
    return {
      success: false,
      message: errorMsg,
    };
  }
}