import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type GeolocationPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

interface GeolocationConfigState {
  // Geolocation
  permission: GeolocationPermission;
  latitude: number | null;
  longitude: number | null;
  geoError: string | null;

  // Configuration from API
  currency: string | null;
  configData: Record<string, any> | null;
  configLoading: boolean;
  configError: string | null;

  // Actions
  setPermission: (permission: GeolocationPermission) => void;
  setCoordinates: (lat: number, lng: number) => void;
  setGeoError: (error: string) => void;
  setConfigData: (data: Record<string, any>, currency: string) => void;
  setConfigLoading: (loading: boolean) => void;
  setConfigError: (error: string | null) => void;
  reset: () => void;
  hasLocationAccess: () => boolean;
}

export const useGeolocationConfigStore = create<GeolocationConfigState>()(
  devtools(
    (set, get) => ({
      permission: 'prompt',
      latitude: null,
      longitude: null,
      geoError: null,
      currency: null,
      configData: null,
      configLoading: false,
      configError: null,

      setPermission: (permission) =>
        set({ permission }, false, 'geolocation/setPermission'),

      setCoordinates: (lat, lng) =>
        set({ latitude: lat, longitude: lng, geoError: null }, false, 'geolocation/setCoordinates'),

      setGeoError: (error) =>
        set({ geoError: error, latitude: null, longitude: null }, false, 'geolocation/setGeoError'),

      setConfigData: (data, currency) =>
        set({ configData: data, currency, configLoading: false, configError: null }, false, 'geolocation/setConfigData'),

      setConfigLoading: (loading) =>
        set({ configLoading: loading }, false, 'geolocation/setConfigLoading'),

      setConfigError: (error) =>
        set({ configError: error, configLoading: false }, false, 'geolocation/setConfigError'),

      reset: () =>
        set({
          permission: 'prompt',
          latitude: null,
          longitude: null,
          geoError: null,
          currency: null,
          configData: null,
          configLoading: false,
          configError: null,
        }, false, 'geolocation/reset'),

      hasLocationAccess: () => {
        const state = get();
        return state.permission === 'granted' && state.latitude !== null && state.longitude !== null;
      },
    }),
    { name: 'GeolocationConfigStore' }
  )
);
