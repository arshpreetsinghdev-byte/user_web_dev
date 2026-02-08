import type { MapOptions, PlaceResult } from '@/types';


type StateChangeCallback = (isLoaded: boolean) => void;

class GoogleMapsService {
  private static instance: GoogleMapsService;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private apiKey: string | null = null;
  private stateListeners: Set<StateChangeCallback> = new Set();

  private constructor() { }

  static getInstance(): GoogleMapsService {
    if (!this.instance) {
      this.instance = new GoogleMapsService();
    }
    return this.instance;
  }

  subscribe(callback: StateChangeCallback): () => void {
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  private notifyStateChange(): void {
    this.stateListeners.forEach(callback => callback(this.isLoaded));
  }

  isReady(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  async loadApiKey(apiKey: string, libraries: string[] = ['places', 'geometry']): Promise<void> {
    if (this.apiKey === apiKey && this.isLoaded) {
      console.log('✅ Google Maps already loaded with same key');
      return;
    }

    if (this.apiKey !== apiKey && this.isLoaded) {
      console.log('🔄 Reloading Google Maps with new key');
      this.removeExistingScript();
      this.isLoaded = false;
      this.notifyStateChange();
    }

    // If already loading, wait for it
    if (this.isLoading && this.loadPromise) {
      console.log('⏳ Google Maps already loading...');
      return this.loadPromise;
    }

    this.apiKey = apiKey;
    this.isLoading = true;
    this.loadPromise = this.loadScript(apiKey, libraries);

    try {
      await this.loadPromise;
      this.isLoaded = true;
      this.notifyStateChange();
    } catch (error) {
      console.error('❌ Failed to load Google Maps:', error);
      this.isLoaded = false;
      this.notifyStateChange();
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  private removeExistingScript(): void {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    if (window.google?.maps) {
      (window as any).google = undefined;
    }

    console.log('🗑️ Removed existing Google Maps script');
  }


  private loadScript(apiKey: string, libraries: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.maps && this.apiKey === apiKey) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));

      document.head.appendChild(script);
    });
  }

  createMap(container: HTMLElement, options: MapOptions): google.maps.Map | null {
    if (!this.isReady()) {
      console.warn('Google Maps not ready yet');
      return null;
    }

    return new google.maps.Map(container, {
      center: options.center,
      zoom: options.zoom || 12,
      disableDefaultUI: options.disableDefaultUI ?? false,
      styles: options.styles,
    });
  }


  addMarker(
    map: google.maps.Map,
    position: { lat: number; lng: number },
    options?: {
      title?: string;
      icon?: string | google.maps.Icon;
      draggable?: boolean;
      onClick?: () => void;
    }
  ): google.maps.Marker | null {
    if (!this.isReady()) return null;

    const marker = new google.maps.Marker({
      map,
      position,
      title: options?.title,
      icon: options?.icon,
      draggable: options?.draggable ?? false,
    });

    if (options?.onClick) {
      marker.addListener('click', options.onClick);
    }

    return marker;
  }

  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    if (!this.isReady()) return 0;

    const from = new google.maps.LatLng(point1.lat, point1.lng);
    const to = new google.maps.LatLng(point2.lat, point2.lng);

    return google.maps.geometry.spherical.computeDistanceBetween(from, to);
  }

  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    if (!this.isReady()) throw new Error('Google Maps not ready');

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (!this.isReady()) throw new Error('Google Maps not ready');

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  setupAutocomplete(
    input: HTMLInputElement,
    onPlaceSelect: (place: PlaceResult) => void,
    options?: {
      componentRestrictions?: { country: string | string[] };
      types?: string[];
      fields?: string[];
    }
  ): (() => void) | null {
    if (!this.isReady()) {
      console.warn('⚠️ Google Maps not ready. Cannot setup autocomplete.');
      return null;
    }

    try {
      const autocompleteOptions: google.maps.places.AutocompleteOptions = {
        fields: options?.fields || [
          'formatted_address',
          'geometry',
          'place_id',
          'address_components',
        ],
      };

      // Only add componentRestrictions if provided
      if (options?.componentRestrictions) {
        autocompleteOptions.componentRestrictions = options.componentRestrictions;
      }

      // Only add types if provided (must be an array)
      if (options?.types && Array.isArray(options.types)) {
        autocompleteOptions.types = options.types;
      }

      const autocomplete = new google.maps.places.Autocomplete(input, autocompleteOptions);

      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry?.location) {
          console.warn('⚠️ No geometry found for selected place');
          return;
        }

        const placeData = this.extractPlaceData(place);
        onPlaceSelect(placeData);
      });

      console.log('✅ Autocomplete setup on input');

      // Return cleanup function
      return () => {
        google.maps.event.removeListener(listener);
        google.maps.event.clearInstanceListeners(input);
      };
    } catch (error) {
      console.error('❌ Failed to setup autocomplete:', error);
      return null;
    }
  }


  plotMap(container: HTMLElement, options: MapOptions): google.maps.Map | null {
    if (!this.isReady()) {
      console.warn('⚠️ Google Maps not ready yet. Call loadApiKey() first.');
      return null;
    }

    try {
      const map = new google.maps.Map(container, {
        center: options.center,
        zoom: options.zoom || 12,
        disableDefaultUI: options.disableDefaultUI ?? false,
        styles: options.styles,
      });

      console.log('🗺️ Map plotted successfully');
      return map;
    } catch (error) {
      console.error('❌ Failed to plot map:', error);
      return null;
    }
  }


  private extractPlaceData(place: google.maps.places.PlaceResult): PlaceResult {
    const getAddressComponent = (type: string): string => {
      const component = place.address_components?.find(c => c.types.includes(type));
      return component?.long_name || '';
    };

    return {
      address: place.formatted_address || '',
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
      placeId: place.place_id || '',
      city: getAddressComponent('locality'),
      state: getAddressComponent('administrative_area_level_1'),
      country: getAddressComponent('country'),
      postalCode: getAddressComponent('postal_code'),
    };
  }

  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>
  ): Promise<{
    distance: number; // in meters
    duration: number; // in seconds
    distanceText: string;
    durationText: string;
    path: Array<{ lat: number; lng: number }>;
  } | null> {
    if (!this.isReady()) {
      console.warn('⚠️ Google Maps not ready. Cannot calculate route.');
      return null;
    }

    try {
      const directionsService = new google.maps.DirectionsService();

      const waypointsFormatted: google.maps.DirectionsWaypoint[] = waypoints
        ? waypoints.map(wp => ({
          location: new google.maps.LatLng(wp.lat, wp.lng),
          stopover: true,
        }))
        : [];

      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypointsFormatted,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      };

      const result = await directionsService.route(request);

      if (result.routes.length === 0) {
        console.warn('⚠️ No routes found');
        return null;
      }

      // Calculate total distance and duration
      let totalDistance = 0;
      let totalDuration = 0;

      result.routes[0].legs.forEach(leg => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      const distanceInKm = (totalDistance / 1000).toFixed(2);
      const durationInMinutes = Math.ceil(totalDuration / 60);

      // Extract path
      const path = result.routes[0].overview_path.map(point => ({
        lat: point.lat(),
        lng: point.lng()
      }));

      console.log('🗺️ Route calculated:', {
        distance: `${distanceInKm} km`,
        duration: `${durationInMinutes} minutes`,
      });

      return {
        distance: totalDistance,
        duration: totalDuration,
        distanceText: `${distanceInKm} km`,
        durationText: `${durationInMinutes} min`,
        path
      };
    } catch (error) {
      console.error('❌ Failed to calculate route:', error);
      return null;
    }
  }
}

export const mapsService = GoogleMapsService.getInstance();

