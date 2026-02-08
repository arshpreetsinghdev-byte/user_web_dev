"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import TimelineRow from "./TimelineRow";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import { useBookingStore } from "@/stores/booking.store";
import type { PlaceResult, Location } from "@/types";

interface DestinationFieldProps {
  value: Location | null;
  onChange: (value: Location | null) => void;
  className?: string;
  variant?: "outline" | "filled";
}

const DestinationField = memo(({ value, onChange, className, variant }: DestinationFieldProps) => {
  const { setDropoffFromPlace } = useBookingStore();
  const [inputValue, setInputValue] = useState(value?.address || "");

  // Sync input value when location changes externally
  useEffect(() => {
    setInputValue(value?.address || "");
  }, [value?.address]);

  const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      // Update input text
      setInputValue(place.address);
      
      // Update booking store
      setDropoffFromPlace(place);
      
      // Update with complete location object
      onChange({
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        placeId: place.placeId,
      });
      console.log('🎯 Destination selected:', place);
    },
    [onChange, setDropoffFromPlace]
  );

  const inputRef = useGoogleAutocomplete({
    onPlaceSelect: handlePlaceSelect,
    country: 'in',
  });

  return (
    <TimelineRow
      icon={<Navigation className={`w-3 h-3 sm:w-4 sm:h-4 text-primary fill-primary ${variant === "outline" ? "text-black! fill-black!" : ""}`} />}
      showConnectorAbove={true}
      variant={variant}
    >
      <label className={`text-xs lg:text-sm text-white/90 mb-1.5 block font-medium ${variant === "outline" ? "text-black!" : ""}`}>
        Destination
      </label>
      <Input
        ref={inputRef}
        placeholder="Enter your destination"
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

DestinationField.displayName = "DestinationField";

export default DestinationField;
