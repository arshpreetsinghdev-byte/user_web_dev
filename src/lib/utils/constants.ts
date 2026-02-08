// App Constants
export const APP_NAME = 'TaxiBook';
export const APP_VERSION = '1.0.0';

// API Constants
export const API_TIMEOUT = 30000; // 30 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  RECENT_LOCATIONS: 'recent_locations',
} as const;

// Supported Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
] as const;

export const DEFAULT_LANGUAGE = 'en';

// Navigation Items
export const NAV_ITEMS = [
  { key: 'history', label: 'History' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'support', label: 'Get Support' }
] as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
  UPI: 'upi',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Vehicle Types
export const VEHICLE_TYPES = {
  BIKE: 'bike',
  AUTO: 'auto',
  MINI: 'mini',
  SEDAN: 'sedan',
  SUV: 'suv',
  PREMIUM: 'premium',
} as const;

// Map Constants
export const MAP_DEFAULT_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

export const MAP_DEFAULT_ZOOM = 13;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY hh:mm A',
  TIME: 'hh:mm A',
  SHORT: 'DD/MM/YYYY',
} as const;

// Currency
export const CURRENCY = {
  SYMBOL: '$',
  CODE: 'USD',
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  PHONE_LENGTH: 10,
} as const;
