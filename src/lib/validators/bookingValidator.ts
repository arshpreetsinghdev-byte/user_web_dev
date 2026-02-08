import type { Location } from "@/types";
import type { Stop } from "@/components/booking/types";

export interface BookingFormData {
  pickup: Location | null;
  destination: Location | null;
  stops: Stop[];
  scheduledDateTime: Date | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}


const isSameLocation = (a: any, b: any) => {
  if (!a || !b) return false;

  const addrA = String(a.address ?? a.chosen_address ?? "").trim();
  const addrB = String(b.address ?? b.chosen_address ?? "").trim();

  if (addrA && addrB && addrA === addrB) return true;

  const latA = a.lat ?? a.latitude;
  const lngA = a.lng ?? a.longitude;
  const latB = b.lat ?? b.latitude;
  const lngB = b.lng ?? b.longitude;

  if (
    latA !== undefined &&
    latB !== undefined &&
    lngA !== undefined &&
    lngB !== undefined
  ) {
    return latA === latB && lngA === lngB;
  }

  return false;
};

const isValidCoordinate = (lat?: number, lng?: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat! >= -90 && lat! <= 90 &&
  lng! >= -180 && lng! <= 180;

export const bookingValidator = {
    validateRouteSequence(
    pickup: Location | null,
    stops: Stop[],
    destination: Location | null
  ): ValidationResult {

    const routePoints: any[] = [
      { label: "Pickup", data: pickup },
      ...stops.map((s, i) => ({ label: `Stop ${i + 1}`, data: s })),
      { label: "Destination", data: destination },
    ];

    // Validate presence of all route points
    for (const point of routePoints) {
      const loc = point.data;
      const lat = (loc as any)?.lat ?? (loc as any)?.latitude;
      const lng = (loc as any)?.lng ?? (loc as any)?.longitude;
      const address = loc?.address ?? loc?.chosen_address;

      if (!address || !isValidCoordinate(lat, lng)) {
        return {
          isValid: false,
          error: `Please select a valid ${point.label.toLowerCase()} location`,
        };
      }
    }

    // Validate adjacent points in route order (THIS FIXES YOUR BUG)
    for (let i = 0; i < routePoints.length - 1; i++) {
      const current = routePoints[i];
      const next = routePoints[i + 1];

      if (isSameLocation(current.data, next.data)) {
        return {
          isValid: false,
          error: `${current.label} cannot be the same as ${next.label}`,
        };
      }
    }

    // Detect duplicates anywhere in route
    for (let i = 0; i < routePoints.length; i++) {
      for (let j = i + 1; j < routePoints.length; j++) {
        if (isSameLocation(routePoints[i].data, routePoints[j].data)) {
          return {
            isValid: false,
            error: `${routePoints[j].label} duplicates ${routePoints[i].label}`,
          };
        }
      }
    }

    return { isValid: true };
  },

  /**
   * Validate pickup location
   */
  validatePickup(pickup: Location | null): ValidationResult {
    const lat = (pickup as any)?.lat ?? (pickup as any)?.latitude;
    const lng = (pickup as any)?.lng ?? (pickup as any)?.longitude;
    if (!pickup || !pickup?.address || !isValidCoordinate(lat, lng)) {
      return {
        isValid: false,
        error: "Please select a valid pickup location",
      };
    }
    return { isValid: true };
  },

  /**
   * Validate destination location
   */
  validateDestination(destination: Location | null): ValidationResult {
    const lat = (destination as any)?.lat ?? (destination as any)?.latitude;
    const lng = (destination as any)?.lng ?? (destination as any)?.longitude;
    if (!destination || !destination?.address || !isValidCoordinate(lat, lng)) {
      return {
        isValid: false,
        error: "Please select a valid destination",
      };
    }
    return { isValid: true };
  },

  /**
   * Validate scheduled date time (optional - only validate if provided)
   */
  validateScheduledDateTime(scheduledDateTime: Date | null): ValidationResult {
    // Scheduled time is now required
    if (!scheduledDateTime) {
      return { isValid: false, error: "Please select a pickup date and time" };
    }

    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + 15 * 60 * 1000); // Current time + 15 minutes

    if (scheduledDateTime < minAllowedTime) {
      return {
        isValid: false,
        error: "Schedule time must be at least 15 minutes from now",
      };
    }

    return { isValid: true };
  },

  /**
   * Validate entire booking form
   */
  validateBookingForm(data: BookingFormData): ValidationResult {
    // Validate pickup
    const pickupValidation = this.validatePickup(data.pickup);
    if (!pickupValidation.isValid) {
      return pickupValidation;
    }

    // Validate destination
    const destinationValidation = this.validateDestination(data.destination);
    if (!destinationValidation.isValid) {
      return destinationValidation;
    }

    // Validate stops (also check against pickup/destination and duplicates)
    const routeValidation = this.validateRouteSequence(
      data.pickup,
      data.stops,
      data.destination
    );
    if (!routeValidation.isValid) {
      return routeValidation;
    }

    // Validate scheduled time
    const scheduleValidation = this.validateScheduledDateTime(data.scheduledDateTime);
    if (!scheduleValidation.isValid) {
      return scheduleValidation;
    }

    return { isValid: true };
  },

  /**
   * Validate stops only (convenience wrapper for legacy callers)
   */
  validateStops(stops: Stop[], pickup: Location | null, destination: Location | null): ValidationResult {
    return this.validateRouteSequence(pickup, stops, destination);
  },
};
