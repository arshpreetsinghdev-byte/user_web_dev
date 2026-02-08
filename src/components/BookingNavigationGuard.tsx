"use client";

import { useEffect, useRef } from "react";
import { useBookingStore } from "@/stores/booking.store";

export default function BookingNavigationGuard() {
  const resetBooking = useBookingStore((state) => state.resetBooking);
  const clearStorage = useBookingStore.persist?.clearStorage;
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const navType = navEntry?.type || "navigate";

    // Any hard page load (navigate/reload) should clear stale booking data; SPA transitions remain untouched.
    const shouldClear = navType === "reload" || navType === "navigate";

    if (shouldClear) {
      resetBooking();
      clearStorage?.();
    }
  }, [clearStorage, resetBooking]);

  return null;
}
