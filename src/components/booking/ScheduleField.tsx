"use client";

import { memo, useRef, useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import TimelineRow from "./TimelineRow";
import { cn } from '@/lib/utils';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleFieldProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  className?: string;
  variant?: "outline" | "filled";
}

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const ScheduleField = memo(({ value, onChange, className, variant }: ScheduleFieldProps) => {
  const [internalDate, setInternalDate] = useState<Date | undefined>(value || new Date());

  const getInitialTime = () => {
    const d = value || new Date();
    let mins = Math.ceil(d.getMinutes() / 5) * 5;

    // Handle rollover to next hour if minutes reach 60
    if (mins >= 60) {
      d.setHours(d.getHours() + 1);
      mins = 0;
    }

    return {
      hour: (d.getHours() % 12 || 12).toString().padStart(2, '0'),
      minute: mins.toString().padStart(2, '0'),
      period: (d.getHours() >= 12 ? "PM" : "AM") as "AM" | "PM"
    };
  };

  const initialTime = getInitialTime();
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initialTime.period);

  // Sync internal state with prop value if it changes externally
  useEffect(() => {
    if (value) {
      setInternalDate(value);
      const d = new Date(value);
      let mins = Math.ceil(d.getMinutes() / 5) * 5;
      if (mins >= 60) {
        d.setHours(d.getHours() + 1);
        mins = 0;
      }
      setHour((d.getHours() % 12 || 12).toString().padStart(2, '0'));
      setMinute(mins.toString().padStart(2, '0'));
      setPeriod(d.getHours() >= 12 ? "PM" : "AM");
    }
  }, [value]);

  const handleSelectDate = (date: Date | undefined) => {
    setInternalDate(date);
    updateDateTime(date, hour, minute, period);
  };

  const handleHourChange = (h: string) => {
    setHour(h);
    updateDateTime(internalDate, h, minute, period);
  };

  const handleMinuteChange = (m: string) => {
    setMinute(m);
    updateDateTime(internalDate, hour, m, period);
  };

  const handlePeriodChange = (p: "AM" | "PM") => {
    setPeriod(p);
    updateDateTime(internalDate, hour, minute, p);
  };

  const updateDateTime = (date: Date | undefined, h: string, m: string, p: "AM" | "PM") => {
    if (!date) return;

    let finalHour = parseInt(h);
    if (p === "PM" && finalHour < 12) finalHour += 12;
    if (p === "AM" && finalHour === 12) finalHour = 0;

    const updated = new Date(date);
    updated.setHours(finalHour);
    updated.setMinutes(parseInt(m));
    updated.setSeconds(0);
    updated.setMilliseconds(0);

    onChange(updated);
  };

  // Pretty display format (e.g., 17 Jan 2026, 07:30 PM)
  const formatDisplayValue = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "dd MMM yyyy, hh:mm a");
  };

  return (
    <TimelineRow
      icon={<Clock className={`w-3 h-3 sm:w-4 sm:h-4 text-primary ${variant === "outline" ? "text-black!" : ""}`} />}
      showConnectorAbove={true}
      showConnectorBelow={false}
      variant={variant}
    >
      <label className={`text-xs lg:text-sm text-white/90 mb-1.5 block font-medium ${variant === "outline" ? "text-black!" : ""}`}>
        Schedule Ride
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <div
            className="relative group cursor-pointer w-full"
          >
            <Input
              type="text"
              readOnly
              placeholder="Select Date & Time"
              value={formatDisplayValue(value)}
              className={cn(
                "h-9 lg:h-11 px-4 pr-10 bg-white text-gray-900 placeholder:text-gray-400 border-0 focus-visible:ring-2 focus-visible:ring-white/50 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50",
                variant === "outline" ? "border border-border" : "",
                className
              )}
            />

            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-70 p-0 bg-white border-neutral-200 shadow-2xl rounded-2xl overflow-visible" align="start" sideOffset={8}>
          <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
            <h4 className="font-bold text-sm text-neutral-900">Choose Pickup Time</h4>
            <p className="text-[10px] text-neutral-500">Plan your ride in advance</p>
          </div>

          <div className="bg-white">
            <Calendar
              mode="single"
              selected={internalDate}
              onSelect={handleSelectDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              autoFocus
              className="p-2"
            />
          </div>

          <div className="p-3 bg-neutral-50/80 border-t border-neutral-100 z-100">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-neutral-600 mb-1 block uppercase tracking-wider">Hour</label>
                <Select value={hour} onValueChange={handleHourChange}>
                  <SelectTrigger className="w-full bg-white border-neutral-200 h-9 text-xs rounded-lg focus:ring-primary/20">
                    <SelectValue placeholder="Hr" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border-neutral-200">
                    {hours.map((h) => (
                      <SelectItem key={h} value={h.toString().padStart(2, '0')} className="text-xs focus:bg-primary/10 focus:text-primary">
                        {h.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-semibold text-neutral-600 mb-1 block uppercase tracking-wider">Minute</label>
                <Select value={minute} onValueChange={handleMinuteChange}>
                  <SelectTrigger className="w-full bg-white border-neutral-200 h-9 text-xs rounded-lg focus:ring-primary/20">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border-neutral-200">
                    {minutes.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs focus:bg-primary/10 focus:text-primary">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-[10px] font-semibold text-neutral-600 mb-1 block uppercase tracking-wider">AM/PM</label>
                <Select value={period} onValueChange={(v) => handlePeriodChange(v as any)}>
                  <SelectTrigger className="w-full bg-white border-neutral-200 h-9 text-xs rounded-lg focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl border-neutral-200">
                    <SelectItem value="AM" className="text-xs focus:bg-primary/10 focus:text-primary">AM</SelectItem>
                    <SelectItem value="PM" className="text-xs focus:bg-primary/10 focus:text-primary">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200/50">
              <p className="text-[10px] text-center text-neutral-400 italic">
                Selected: {value ? format(value, "PPp") : "No time selected"}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TimelineRow>
  );
});

ScheduleField.displayName = "ScheduleField";

export default ScheduleField;
