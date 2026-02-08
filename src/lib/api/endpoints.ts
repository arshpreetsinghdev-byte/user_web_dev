/**
 * API Endpoints Configuration
 * All backend API endpoints are defined here
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    AUTHORIZATION: '/open/v1/authorization',
    VERIFY_SESSION: '/open/v1/verify_session',
    FETCH_OPERATOR_PARAMS: '/open/v1/fetch_operator_params',
    FETCH_CONFIGURATION_USER_WEB: '/open/v1/fetch_configuration_user_web',
    GENERATE_CUSTOMER_LOGIN_OTP: '/open/v1/generate_customer_login_otp',
    VERIFY_CUSTOMER_OTP: '/open/v1/verify_customer_otp',
    UPDATE_USER_PROFILE: '/open/v1/update_user_profile',
    GET_USER_PROFILE: '/open/v1/get_user_profile_details',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Booking
  BOOKING: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAILS: (id: number | string) => `/bookings/${id}`,
    CANCEL: (id: number | string) => `/bookings/${id}/cancel`,
    ESTIMATE: '/bookings/estimate',
    TRACK: (id: number | string) => `/bookings/${id}/track`,
    INSERT_PICKUP_SCHEDULE: '/open/v1/insert_pickup_schedule',
  },

  // Vehicles
  VEHICLES: {
    LIST: '/vehicles',
    DETAILS: (id: number | string) => `/vehicles/${id}`,
    AVAILABLE: '/vehicles/available',
  },

  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    FETCH_WALLET_BALANCE: '/open/v1/fetch_wallet_balance',
    TRANSACTIONS: '/wallet/transactions',
    ADD_MONEY: '/wallet/add-money',
    WITHDRAW: '/wallet/withdraw',
    GET_TRANSACTION_HISTORY: '/open/v1/get_transaction_history',
    SETTLE_NEGATIVE_WALLET_BALANCE: '/open/v1/settle_negative_wallet_balance',
  },

  // History
  HISTORY: {
    RIDES: '/open/v1/fetch_integrated_order_history',
    RIDE_DETAILS: (id: number | string) => `/open/v1/get_ride_details`,
    GET_RIDE_SUMMARY: '/open/v1/get_ride_summary',
    REMOVE_PICKUP_SCHEDULE: '/open/v1/remove_pickup_schedule',
    MODIFY_PICKUP_SCHEDULE: '/open/v1/modify_pickup_schedule',
    RATE_DRIVER: '/open/v1/rate_the_driver',
  },

  // Payment
  PAYMENT: {
    METHODS: '/payment/methods',
    CREATE: '/payment/create',
    VERIFY: '/payment/verify',
    PROCESS: '/payment/process',
  },

  // Coupons
  COUPONS: {
    LIST: '/open/v1/get_coupons_promos',
    VALIDATE: '/open/v1/validate_coupon',
    APPLY: '/open/v1/apply_coupon',
  },

  // Maps/Location
  MAPS: {
    GEOCODE: '/maps/geocode',
    REVERSE_GEOCODE: '/maps/reverse-geocode',
    DIRECTIONS: '/maps/directions',
    DISTANCE_MATRIX: '/maps/distance-matrix',
  },

  // Config
  CONFIG: {
    GOOGLE_API_KEY: '/config/google-api-key',
  },

  // Vehicle/Driver Discovery
  VEHICLE: {
    FIND_DRIVER: '/open/v1/find_a_driver',
    GET_FARE_ESTIMATE: '/open/v1/get_fare_estimate',
  },

  // PRODUCTION: {
  //   AUTOS_BASE_URL: 'https://prod-acl-staging.jugnoo.in',
  //   BUSINESS_ID: '22156',
  //   BUSINESS_TOKEN: '31992b8102486bf5807577e2c5bb61ce763b535137856b5e0573f595ac717b54'
  // }
  PRODUCTION: {
    AUTOS_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://test.jugnoo.in:8068',
    BUSINESS_ID: process.env.NEXT_PUBLIC_BUSINESS_ID || '1001',
    BUSINESS_TOKEN: process.env.NEXT_PUBLIC_BUSINESS_TOKEN || 'a5c5432676219e9fd380ac5a28d8ae4ab2b9e1e55cd75617b5c7955ee74d0397'
  }
} as const;

export const BASE_URL = API_ENDPOINTS.PRODUCTION.AUTOS_BASE_URL;
export const BUSINESS_ID = API_ENDPOINTS.PRODUCTION.BUSINESS_ID;
export const BUSINESS_TOKEN = API_ENDPOINTS.PRODUCTION.BUSINESS_TOKEN;
