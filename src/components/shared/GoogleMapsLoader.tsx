"use client";

import { useEffect } from 'react';
import { useGoogleMapsStore } from '@/stores/googleMaps.store';

interface GoogleMapsLoaderProps {
  apiKey: string;
}

export function GoogleMapsLoader({ apiKey }: GoogleMapsLoaderProps) {
  const { loadApiKey, isLoaded, isLoading } = useGoogleMapsStore();

  useEffect(() => {
    if (!apiKey || isLoaded || isLoading) {
      return;
    }
    loadApiKey(apiKey);
  }, [apiKey, loadApiKey, isLoaded, isLoading ]);

  return null;
}
