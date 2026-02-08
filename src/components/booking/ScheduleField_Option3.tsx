"use client";

import { memo } from "react";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import TimelineRow from "./TimelineRow";

interface ScheduleFieldProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
}

/**
 * Calendar datetime picker
 */
const ScheduleField_Option3 = memo(({ value, onChange }: ScheduleFieldProps) => {
  const formatDateTimeLocal = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      onChange(new Date(inputValue));
    } else {
      onChange(null);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    return formatDateTimeLocal(now);
  };

  return (
    <TimelineRow
      icon={<Clock className="w-4 h-4 sm:w-4 sm:h-4 text-primary" />}
      showConnectorAbove={true}
      showConnectorBelow={false}
    >
      <label className="text-xs lg:text-sm text-white/90 mb-1.5 block font-medium">
        Schedule Ride
      </label>
      <Input
        type="datetime-local"
        value={formatDateTimeLocal(value)}
        onChange={handleDateTimeChange}
        min={getMinDateTime()}
        className="w-full h-9 lg:h-11 px-4 bg-white text-gray-900 border-0 focus-visible:ring-2 focus-visible:ring-white/50 text-sm"
      />
    </TimelineRow>
  );
});

ScheduleField_Option3.displayName = "ScheduleField_Option3";

export default ScheduleField_Option3;
