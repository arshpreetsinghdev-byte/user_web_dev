import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Location, Vehicle, PriceEstimate } from '@/types';
import type { Stop, BookingLocation, DistanceTimeResult } from '@/components/booking/types';
import { createEmptyLocation, placeToBookingLocation } from '@/components/booking/types';
import type { VehicleRegion } from '@/types';
import type { PlaceResult } from '@/types';

interface BookingState {
  // Enhanced Locations with coordinates
  pickupLocation: BookingLocation;
  dropoffLocation: BookingLocation;

  // Distance/Time calculation
  distanceTime: DistanceTimeResult | null;
  isCalculatingDistance: boolean;

  // Schedule
  schedule: 'now' | 'scheduled';
  scheduleDateTime: Date | null;

  // Legacy Locations (for backward compatibility)
  pickup: Location | null;
  dropoff: Location | null;
  stops: Stop[]; // Array of stop locations

  // Schedule
  scheduledDateTime: Date | null; // Scheduled date and time
  isScheduleDateTouched: boolean;

  // Region/Vehicle selection
  selectedRegion: VehicleRegion | null;
  availableVehicles: VehicleRegion[];

  // Price estimate
  priceEstimate: PriceEstimate | null;

  // Services and coupons
  serviceData: any[]; // Store fetched services
  selectedService: any | null; // Selected service
  selectedServices: number[];
  appliedCoupon: number | null;

  // Passenger and luggage
  passengerCount: number;
  luggageCount: number;
  driverNote: string;
  flightNumber: string;
  customerName: string;
  customerPhone: string;
  customerCountryCode: string;

  // Pickup city details
  pickupCityCurrency: string | null;
  pickupCityOffset: number | null;

  // Route calculation
  routeDistance: number | null; // in meters
  routeDuration: number | null; // in seconds
  routeDistanceText: string | null;
  routeDurationText: string | null;

  // Payment
  selectedPaymentMethod: string | null;
  selectedCardId: string | null; // For Stripe card payment
  selectedSquareCardId: string | null; // For Square card payment

  // Booking result from API
  bookingResult: {
    flag: number;
    message: string;
    fareText?: string;
  } | null;

  // State
  isLoading: boolean;

  // Stepper state
  currentStepIndex: number;
  previousStepIndex: number | null;
  nextStepIndex: number | null;

  // Actions
  setPickup: (location: Location | null) => void;
  setDropoff: (location: Location | null) => void;
  setPickupFromPlace: (place: PlaceResult) => void;
  setDropoffFromPlace: (place: PlaceResult) => void;
  setStops: (stops: Stop[]) => void;
  setScheduledDateTime: (dateTime: Date | null) => void;
  setIsScheduleDateTouched: (touched: boolean) => void;
  setServiceData: (services: any[]) => void;
  setSelectedService: (service: any | null) => void;
  setPickupCityCurrency: (currency: string | null) => void;
  setPickupCityOffset: (offset: number | null) => void;
  setRouteData: (data: { distance: number; duration: number; distanceText: string; durationText: string } | null) => void;
  setSelectedRegion: (region: VehicleRegion | null) => void;
  setAvailableVehicles: (vehicles: VehicleRegion[]) => void;
  setPriceEstimate: (estimate: PriceEstimate | null) => void;
  setSelectedServices: (services: number[]) => void;
  setAppliedCoupon: (coupon: number | null) => void;
  setPassengerCount: (count: number) => void;
  setLuggageCount: (count: number) => void;
  setDriverNote: (note: string) => void;
  setFlightNumber: (flightNumber: string) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerCountryCode: (code: string) => void;
  setSelectedPaymentMethod: (method: string | null) => void;
  setSelectedCardId: (cardId: string | number | null) => void; // New action for Stripe card
  setSelectedSquareCardId: (cardId: string | number | null) => void; // New action for Square card
  setBookingResult: (result: { flag: number; message: string; fareText?: string } | null) => void;
  setIsLoading: (loading: boolean) => void;
  setDistanceTime: (result: DistanceTimeResult | null) => void;
  setCurrentStepIndex: (index: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetBooking: () => void;
}

const TOTAL_BOOKING_STEPS = 3;

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        // Enhanced Locations
        pickupLocation: createEmptyLocation(),
        dropoffLocation: createEmptyLocation(),

        // Distance/Time
        distanceTime: null,
        isCalculatingDistance: false,

        // Schedule
        schedule: 'now',
        scheduleDateTime: null,

        // Legacy Locations
        pickup: null,
        dropoff: null,
        stops: [],
        scheduledDateTime: null,
        isScheduleDateTouched: false,
        selectedRegion: null,
        availableVehicles: [],
        priceEstimate: null,
        serviceData: [],
        selectedService: null,
        selectedServices: [],
        appliedCoupon: null,
        passengerCount: 1,
        luggageCount: 0,
        driverNote: '',
        flightNumber: '',
        customerName: '',
        customerPhone: '',
        customerCountryCode: '',
        selectedPaymentMethod: null,
        selectedCardId: null, // Initialize Stripe card ID
        selectedSquareCardId: null, // Initialize Square card ID
        bookingResult: null,
        isLoading: false,
        pickupCityCurrency: null,
        pickupCityOffset: null,
        routeDistance: null,
        routeDuration: null,
        routeDistanceText: null,
        routeDurationText: null,
        currentStepIndex: 0,
        previousStepIndex: null,
        nextStepIndex: 1,

        setPickup: (location) => {
          console.log('Setting pickup location to:', location);
          set({ pickup: location }, false, 'booking/setPickup');
        },

        setDropoff: (location) =>
          set({ dropoff: location }, false, 'booking/setDropoff'),

        setPickupFromPlace: (place) => {
          const bookingLocation = placeToBookingLocation(place);
          set({
            pickupLocation: bookingLocation,
            pickup: {
              address: place.address,
              lat: place.lat,
              lng: place.lng,
              placeId: place.placeId,
            }
          }, false, 'booking/setPickupFromPlace');
          console.log('📍 Pickup set from place:', bookingLocation);
        },

        setScheduledDateTime: (dateTime) =>
          set(
            {
              scheduledDateTime: dateTime,
              isScheduleDateTouched: true, // 👈 key line
            },
            false,
            'booking/setScheduledDateTime'
          ),
          setIsScheduleDateTouched: (touched) =>
            set({ isScheduleDateTouched: touched }, false, 'booking/setIsScheduleDateTouched'),

        setDropoffFromPlace: (place) => {
          const bookingLocation = placeToBookingLocation(place);
          set({
            dropoffLocation: bookingLocation,
            dropoff: {
              address: place.address,
              lat: place.lat,
              lng: place.lng,
              placeId: place.placeId,
            }
          }, false, 'booking/setDropoffFromPlace');
          console.log('🎯 Dropoff set from place:', bookingLocation);
        },

        setStops: (stops) =>
          set({ stops }, false, 'booking/setStops'),

        setServiceData: (services) =>
          set({ serviceData: services }, false, 'booking/setServiceData'),

        setSelectedService: (service) =>
          set({ selectedService: service }, false, 'booking/setSelectedService'),

        setPickupCityCurrency: (currency) =>
          set({ pickupCityCurrency: currency }, false, 'booking/setPickupCityCurrency'),

        setPickupCityOffset: (offset) =>
          set({ pickupCityOffset: offset }, false, 'booking/setPickupCityOffset'),

        setRouteData: (data) =>
          set(
            data
              ? {
                routeDistance: data.distance,
                routeDuration: data.duration,
                routeDistanceText: data.distanceText,
                routeDurationText: data.durationText,
                distanceTime: {
                  rideTime: Math.round(data.duration / 60),
                  rideDistance: Math.round(data.distance / 1000 * 100) / 100,
                  distanceText: data.distanceText,
                  durationText: data.durationText,
                }
              }
              : {
                routeDistance: null,
                routeDuration: null,
                routeDistanceText: null,
                routeDurationText: null,
                distanceTime: null,
              },
            false,
            'booking/setRouteData'
          ),


        setSelectedRegion: (region) =>
          set({ selectedRegion: region }, false, 'booking/setSelectedRegion'),

        setAvailableVehicles: (vehicles) =>
          set({ availableVehicles: vehicles }, false, 'booking/setAvailableVehicles'),

        setPriceEstimate: (estimate) =>
          set({ priceEstimate: estimate }, false, 'booking/setPriceEstimate'),

        setSelectedServices: (services) =>
          set({ selectedServices: services }, false, 'booking/setSelectedServices'),

        setAppliedCoupon: (coupon) =>
          set({ appliedCoupon: coupon }, false, 'booking/setAppliedCoupon'),

        setPassengerCount: (count) =>
          set({ passengerCount: count }, false, 'booking/setPassengerCount'),

        setLuggageCount: (count) =>
          set({ luggageCount: count }, false, 'booking/setLuggageCount'),

        setDriverNote: (note) =>
          set({ driverNote: note }, false, 'booking/setDriverNote'),

        setFlightNumber: (flightNumber) =>
          set({ flightNumber: flightNumber }, false, 'booking/setFlightNumber'),

        setCustomerName: (name) =>
          set({ customerName: name }, false, 'booking/setCustomerName'),

        setCustomerPhone: (phone) =>
          set({ customerPhone: phone }, false, 'booking/setCustomerPhone'),

        setCustomerCountryCode: (code) =>
          set({ customerCountryCode: code }, false, 'booking/setCustomerCountryCode'),

        setSelectedPaymentMethod: (method) =>
          set({ selectedPaymentMethod: method }, false, 'booking/setSelectedPaymentMethod'),

        setSelectedCardId: (cardId) =>
          set({ selectedCardId: cardId ? String(cardId) : null }, false, 'booking/setSelectedCardId'),

        setSelectedSquareCardId: (cardId) =>
          set({ selectedSquareCardId: cardId ? String(cardId) : null }, false, 'booking/setSelectedSquareCardId'),

        setBookingResult: (result) =>
          set({ bookingResult: result }, false, 'booking/setBookingResult'),

        setIsLoading: (loading) =>
          set({ isLoading: loading }, false, 'booking/setIsLoading'),

        setDistanceTime: (result) =>
          set({ distanceTime: result }, false, 'booking/setDistanceTime'),

        setCurrentStepIndex: (index) =>
          set(() => {
            const safeIndex = Math.min(
              TOTAL_BOOKING_STEPS - 1,
              Math.max(0, index)
            );

            const previousStepIndex = safeIndex > 0 ? safeIndex - 1 : null;
            const nextStepIndex =
              safeIndex < TOTAL_BOOKING_STEPS - 1 ? safeIndex + 1 : null;

            return {
              currentStepIndex: safeIndex,
              previousStepIndex,
              nextStepIndex,
            };
          }, false, 'booking/setCurrentStepIndex'),

        goToNextStep: () =>
          set((state) => {
            const nextIndex = Math.min(
              TOTAL_BOOKING_STEPS - 1,
              state.currentStepIndex + 1
            );

            const previousStepIndex = nextIndex > 0 ? nextIndex - 1 : null;
            const nextStepIndex =
              nextIndex < TOTAL_BOOKING_STEPS - 1 ? nextIndex + 1 : null;

            return {
              currentStepIndex: nextIndex,
              previousStepIndex,
              nextStepIndex,
            };
          }, false, 'booking/goToNextStep'),

        goToPreviousStep: () =>
          set((state) => {
            const prevIndex = Math.max(0, state.currentStepIndex - 1);

            const previousStepIndex = prevIndex > 0 ? prevIndex - 1 : null;
            const nextStepIndex =
              prevIndex < TOTAL_BOOKING_STEPS - 1 ? prevIndex + 1 : null;

            return {
              currentStepIndex: prevIndex,
              previousStepIndex,
              nextStepIndex,
            };
          }, false, 'booking/goToPreviousStep'),

        resetBooking: () =>
          set(
            {
              // Reset enhanced locations
              pickupLocation: createEmptyLocation(),
              dropoffLocation: createEmptyLocation(),
              distanceTime: null,
              isCalculatingDistance: false,
              schedule: 'now',
              scheduleDateTime: null,
              // Reset legacy state
              pickup: null,
              dropoff: null,
              stops: [],
              scheduledDateTime: null,
              selectedRegion: null,
              availableVehicles: [],
              priceEstimate: null,
              serviceData: [],
              selectedService: null,
              selectedServices: [],
              appliedCoupon: null,
              passengerCount: 1,
              luggageCount: 0,
              driverNote: '',
              flightNumber: '',
              customerName: '',
              customerPhone: '',
              customerCountryCode: '',
              selectedPaymentMethod: null,
              selectedCardId: null, // Reset Stripe card selection
              bookingResult: null,
              pickupCityCurrency: null,
              pickupCityOffset: null,
              isLoading: false,
              currentStepIndex: 0,
              previousStepIndex: null,
              nextStepIndex: 1,
              routeDistance: null,
              routeDuration: null,
              routeDistanceText: null,
              routeDurationText: null,
              isScheduleDateTouched: false,
            },
            false,
            'booking/resetBooking'
          ),
      }),
      {
        name: 'booking-storage',
        partialize: (state) => ({
          // Only persist essential booking data
          pickupLocation: state.pickupLocation,
          dropoffLocation: state.dropoffLocation,
          pickup: state.pickup,
          dropoff: state.dropoff,
          stops: state.stops,
          scheduledDateTime: state.scheduledDateTime,
          selectedRegion: state.selectedRegion,
          selectedServices: state.selectedServices,
          appliedCoupon: state.appliedCoupon,
          passengerCount: state.passengerCount,
          luggageCount: state.luggageCount,
          driverNote: state.driverNote,
          flightNumber: state.flightNumber,
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          customerCountryCode: state.customerCountryCode,
          selectedPaymentMethod: state.selectedPaymentMethod,
          availableVehicles: state.availableVehicles,
          distanceTime: state.distanceTime,
          serviceData: state.serviceData,
          selectedService: state.selectedService,
        }),
      }
    )
  )
);
