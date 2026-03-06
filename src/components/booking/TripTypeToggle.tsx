"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, RefreshCw } from "lucide-react";

interface TripTypeToggleProps {
  value: 0 | 1; // 0 = one way, 1 = round trip
  onChange: (value: 0 | 1) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * One Way / Round Trip toggle for city-to-city rides.
 * Matches the mobile app UI with two side-by-side options.
 */
export function TripTypeToggle({
  value,
  onChange,
  disabled = false,
  className,
}: TripTypeToggleProps) {
  return (
    <div
      className={cn(
        "flex w-full rounded-lg border border-gray-200 overflow-hidden bg-white",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* One Way */}
      <button
        type="button"
        onClick={() => onChange(0)}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200",
          value === 0
            ? "bg-primary text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50"
        )}
      >
        <ArrowRight className="w-4 h-4" />
        <div className="flex flex-col items-start">
          <span>One Way</span>
          <span
            className={cn(
              "text-[10px] font-normal leading-tight",
              value === 0 ? "text-white/80" : "text-gray-400"
            )}
          >
            Get dropped off
          </span>
        </div>
        {value === 0 && (
          <svg
            className="w-4 h-4 ml-1 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Round Trip */}
      <button
        type="button"
        onClick={() => onChange(1)}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 border-l border-gray-200",
          value === 1
            ? "bg-primary text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50"
        )}
      >
        <RefreshCw className="w-4 h-4" />
        <div className="flex flex-col items-start">
          <span>Round Trip</span>
          <span
            className={cn(
              "text-[10px] font-normal leading-tight",
              value === 1 ? "text-white/80" : "text-gray-400"
            )}
          >
            Keep the car till return
          </span>
        </div>
        {value === 1 && (
          <svg
            className="w-4 h-4 ml-1 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
