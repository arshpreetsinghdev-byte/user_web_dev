"use client";

import { useEffect, useRef } from 'react';
import { mapsService } from '@/lib/google-maps/GoogleMapsService';
import { useGoogleMapsLoaded } from '@/stores/googleMaps.store';
import type { PlaceResult } from '@/types';

interface UseGoogleAutocompleteOptions {
  onPlaceSelect: (place: PlaceResult) => void;
  country?: string | string[];
  types?: string[];
}

export function useGoogleAutocomplete({
  onPlaceSelect,
  country,
  types,
}: UseGoogleAutocompleteOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isLoaded = useGoogleMapsLoaded();

  useEffect(() => {
    if (!isLoaded || !inputRef.current) {
      return;
    }

    const cleanup = mapsService.setupAutocomplete(
      inputRef.current,
      onPlaceSelect,
      {
        componentRestrictions: country ? { country } : undefined,
        types,
      }
    );

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isLoaded, onPlaceSelect, country, types]);

  return inputRef;
}
