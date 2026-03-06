"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useGeolocationConfigStore } from '@/stores/geolocation.store';
import { fetchConfigurationUserWeb } from '@/lib/api/configuration.api';
import { toast } from 'sonner';

export function GeolocationProvider() {
  const {
    permission,
    latitude,
    longitude,
    setPermission,
    setCoordinates,
    setGeoError,
    setConfigData,
    setConfigLoading,
    setConfigError,
  } = useGeolocationConfigStore();

  const hasFetchedConfig = useRef(false);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission('unsupported');
      setGeoError('Geolocation is not supported by this browser.');
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermission('granted');
        setCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPermission('denied');
            setGeoError('Location permission denied. Please enable location access.');
            toast.error('Location permission is required for this app. Please enable it in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setPermission('denied');
            setGeoError('Location information is unavailable.');
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setPermission('denied');
            setGeoError('The request to get your location timed out.');
            toast.error('Location request timed out. Please try again.');
            break;
          default:
            setPermission('denied');
            setGeoError('An unknown error occurred while getting location.');
            toast.error('An unknown error occurred while getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000, // cache for 5 minutes
      }
    );
  }, [setPermission, setCoordinates, setGeoError]);

  // Request geolocation on mount
  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  // Fetch configuration when coordinates are available
  useEffect(() => {
    if (latitude === null || longitude === null || hasFetchedConfig.current) return;

    hasFetchedConfig.current = true;
    setConfigLoading(true);

    fetchConfigurationUserWeb({ latitude, longitude })
      .then((response) => {
        const currency = response.currency || response.data?.currency || '₹';
        setConfigData(response, currency);
        console.log('✅ Fetched user web configuration:', { currency, latitude, longitude });
      })
      .catch((error) => {
        console.error('❌ Failed to fetch user web configuration:', error);
        setConfigError('Failed to fetch configuration');
        hasFetchedConfig.current = false; // allow retry
      });
  }, [latitude, longitude, setConfigData, setConfigLoading, setConfigError]);

  return null;
}
