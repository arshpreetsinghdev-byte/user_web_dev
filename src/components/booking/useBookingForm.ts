import { useCallback } from "react";
import { useBookingStore } from "@/stores/booking.store";
import { bookingValidator } from "@/lib/validators/bookingValidator";
import { toast } from "sonner";
import { bookingService } from "@/services/booking.service";
import type { Stop } from "./types";
import type { Location } from "@/types";

export const useBookingForm = () => {
  // Get data from Zustand store
  const pickup = useBookingStore((state) => state.pickup);
  const dropoff = useBookingStore((state) => state.dropoff);
  const stops = useBookingStore((state) => state.stops);
  const scheduledDateTime = useBookingStore((state) => state.scheduledDateTime);
  const setPickup = useBookingStore((state) => state.setPickup);
  const setDropoff = useBookingStore((state) => state.setDropoff);
  const setStops = useBookingStore((state) => state.setStops);
  const setScheduledDateTime = useBookingStore((state) => state.setScheduledDateTime);
  const setServiceData = useBookingStore((state) => state.setServiceData);
  const setPickupCityCurrency = useBookingStore((state) => state.setPickupCityCurrency);
  const setPickupCityOffset = useBookingStore((state) => state.setPickupCityOffset);
  const setSelectedService = useBookingStore((state) => state.setSelectedService);
  const setRouteData = useBookingStore((state) => state.setRouteData);

  const addStop = useCallback(() => {
    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      order: stops.length + 1,
      latitude: 0,
      longitude: 0,
      chosen_address: "",
    };
    setStops([...stops, newStop]);
  }, [stops, setStops]);

  const removeStop = useCallback((id: number | string) => {
    const updatedStops = stops
      .filter((stop) => stop.id !== id)
      .map((stop, index) => ({ ...stop, order: index + 1 })); // Reorder
    setStops(updatedStops);
  }, [stops, setStops]);

  const updateStop = useCallback(async (id: number | string, location: Location) => {
    try {
      const cfg = await bookingService.fetchConfiguration({ latitude: location.lat, longitude: location.lng });
      const isInvalid = cfg?.flag === 144 || cfg?.data?.flag === 144;
      if (isInvalid) {
        // toast.error("Selected stop is outside the service area");
        return;
      }
    } catch (err) {
      toast.error("Failed to validate stop location. Please try again.");
      return;
    }

    const updatedStops = stops.map((stop) =>
      stop.id === id
        ? {
            ...stop,
            latitude: location.lat,
            longitude: location.lng,
            chosen_address: location.address,
          }
        : stop
    );

    const validation = bookingValidator.validateStops(updatedStops, pickup, dropoff);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid stop");
      return;
    }

    setStops(updatedStops);
  }, [stops, setStops, pickup, dropoff]);

  const resetForm = useCallback(() => {
    setPickup(null);
    setDropoff(null);
    setStops([]);
    setScheduledDateTime(null);
  }, [setPickup, setDropoff, setStops, setScheduledDateTime]);

  const setDestination = useCallback(async (location: Location | null) => {
    if (!location) {
      setDropoff(null);
      return;
    }

    try {
      const cfg = await bookingService.fetchConfiguration({ latitude: location.lat, longitude: location.lng });
      const isInvalid = cfg?.flag === 144 || cfg?.data?.flag === 144;
      if (isInvalid) {
        // toast.error("Selected destination is outside the service area");
        return;
      }
    } catch (err) {
      toast.error("Failed to validate destination. Please try again.");
      return;
    }

    setDropoff(location);
  }, [setDropoff]);

  return {
    pickup,
    setPickup,
    destination: dropoff,
    setDestination: setDestination,
    setServiceData,
    setPickupCityCurrency,
    setPickupCityOffset,
    setSelectedService,
    setRouteData,
    stops,
    scheduledDateTime,
    setScheduledDateTime,
    addStop,
    removeStop,
    updateStop,
    resetForm,
  };
};
