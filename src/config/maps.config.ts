export const mapsConfig = {
  // Google Maps API Key
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  
  // Default map center (New Delhi, India)
  defaultCenter: {
    lat: 28.6139,
    lng: 77.209,
  },
  
  // Default zoom level
  defaultZoom: 13,
  
  // Map options
  mapOptions: {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
  },
  
  // Map styles (can customize map appearance)
  mapStyles: [],
  
  // Libraries to load
  libraries: ['places', 'geometry', 'drawing'] as const,
  
  // Autocomplete options
  autocompleteOptions: {
    types: ['geocode', 'establishment'],
    componentRestrictions: { country: 'us' }, // Change based on your region
  },
  
  // Distance calculation options
  distanceMatrix: {
    travelMode: 'DRIVING' as google.maps.TravelMode,
    unitSystem: google.maps.UnitSystem.METRIC,
  },
} as const;

export type MapsConfig = typeof mapsConfig;
