"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Circle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import TimelineRow from "./TimelineRow";
import { useGoogleAutocomplete } from "@/hooks/useGoogleAutocomplete";
import type { PlaceResult, Location } from "@/types";
import type { Stop } from "./types";

interface StopItemProps {
  stop: Stop;
  index: number;
  onUpdate: (id: number | string, location: Location) => void;
  onRemove: (id: number | string) => void;
  variant?: "outline" | "filled";
}

const StopItem = memo(({ stop, index, onUpdate, onRemove, variant }: StopItemProps) => {
  // Local state for input text (what user is typing)
  const [inputValue, setInputValue] = useState(stop.chosen_address || "");

  // Sync input value when stop changes externally
  useEffect(() => {
    setInputValue(stop.chosen_address || "");
  }, [stop.chosen_address]);

  const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      // Update input text
      setInputValue(place.address);
      
      // Update with complete location object
      onUpdate(stop.id, {
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        placeId: place.placeId,
      });
      
      console.log(`🛑 Stop ${index + 1} selected:`, place);
    },
    [stop.id, index, onUpdate]
  );

  const inputRef = useGoogleAutocomplete({
    onPlaceSelect: handlePlaceSelect,
    country: 'in', // Restrict to India
  });

  return (
    <motion.div
      key={stop.id}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <TimelineRow
        icon={<Circle className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary fill-primary ${variant === "outline" ? "text-black! fill-black!" : ""}`} />}
        iconSize="small"
        showConnectorAbove={true}
        variant={variant}
      >
        <label className={`text-xs lg:text-sm text-white/90 mb-1.5 block font-medium ${variant === "outline" ? "text-black!" : ""}`}>
          Stop {index + 1}
        </label>
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={`Enter stop ${index + 1}`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            className={`h-10 lg:h-11 px-4 pr-10 bg-white text-gray-900 placeholder:text-gray-400 border-0 focus-visible:ring-2 focus-visible:ring-white/50 text-sm ${variant === "outline" ? "border border-border" : ""}`}
          />
          <button
            onClick={() => onRemove(stop.id)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label={`Remove stop ${index + 1}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </TimelineRow>
    </motion.div>
  );
});

StopItem.displayName = "StopItem";

export default StopItem;
