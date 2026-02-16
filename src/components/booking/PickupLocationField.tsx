"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import TimelineRow from "./TimelineRow";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import type { PlaceResult, Location } from "@/types";
import { useBookingStore } from "@/stores/booking.store";

interface PickupLocationFieldProps {
  value: Location | null;
  onChange: (value: Location | null) => void;
  className?: string;
  variant?: "outline" | "filled";
}

const PickupLocationField = memo(({ value, onChange, className, variant }: PickupLocationFieldProps) => {
  // Local state for input text (what user is typing)
  const [inputValue, setInputValue] = useState(value?.address || "");
  const { setPickupFromPlace } = useBookingStore();

  // Sync input value when location changes externally
  useEffect(() => {
    setInputValue(value?.address || "");
  }, [value?.address]);

  const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      // Update input text
      setInputValue(place.address);
      console.log('Input Value set to:', place.address);

      // Update booking store
      setPickupFromPlace(place);
      
      // Update with complete location object
      onChange({
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        placeId: place.placeId,
      });
      
      console.log('📍 Pickup selected:', place);
    },
    [onChange, setPickupFromPlace]
  );

  const inputRef = useGoogleAutocomplete({
    onPlaceSelect: handlePlaceSelect,
    country: 'in', // Restrict to India
  });

  return (
    <TimelineRow
      icon={<MapPin className={`w-3 h-3 sm:w-4 sm:h-4 ${variant === "outline" ? "text-black!" : ""}`} />}
      showConnectorAbove={false}
      variant={variant}
    >
      <label className={`text-xs lg:text-sm text-white/90 mb-1.5 block font-medium ${variant === "outline" ? "text-black!" : ""}`}>
        Pickup Location
      </label>
      <Input
        ref={inputRef}
        placeholder="Enter pickup location"
        value={inputValue}
        onChange={(e) => {
          // Update local input state as user types
          setInputValue(e.target.value);
          
          // Clear location object if input is cleared
          if (!e.target.value) {
            onChange(null);
          }
        }}
        className={`h-9 lg:h-11 px-4 bg-white text-gray-900 placeholder:text-gray-400 border-0 focus-visible:ring-2 focus-visible:ring-white/50 text-sm ${variant === "outline" ? "border border-border" : ""}`}
      />
    </TimelineRow>
  );
});

PickupLocationField.displayName = "PickupLocationField";

export default PickupLocationField;
