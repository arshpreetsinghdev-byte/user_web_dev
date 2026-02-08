"use client";

import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingStore } from "@/stores/booking.store";
import { cn } from "@/lib/utils";

interface ServiceSelectorProps {
  variant?: "outline" | "filled";
}

const ServiceSelector = memo(({ variant }: ServiceSelectorProps) => {
  const serviceData = useBookingStore((state) => state.serviceData);
  const selectedService = useBookingStore((state) => state.selectedService);
  const setSelectedService = useBookingStore((state) => state.setSelectedService);

  const handleServiceChange = (serviceId: string) => {
    const service = serviceData.find((s) => s.id?.toString() === serviceId);
    setSelectedService(service || null);
    console.log('🚕 Service selected:', service);
  };

  if (!serviceData || serviceData.length < 1) {
    return null; // Don't show if no services or only one service
  }

  return (
    <div className="mb-3 lg:mb-4">
      <label className={`text-xs lg:text-sm text-white/90 mb-1.5 block font-medium ${variant === "outline" ? "text-black!" : ""}`}>
        Select Service
      </label>
      <Select
        value={selectedService?.id?.toString() || ""}
        onValueChange={handleServiceChange}
      >
        <SelectTrigger className={cn(
          "w-full h-7 lg:h-7 px-4 py-5 bg-white text-gray-900 placeholder:text-gray-400 border-0 focus-visible:ring-2 focus-visible:ring-white/50 text-base rounded-lg",
          variant === "outline" && "shadow-md"
        )}>
          <SelectValue placeholder="Choose a service" />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-75 overflow-auto">
          {serviceData.map((service) => (
            <SelectItem
              key={service.id || service.name}
              value={service.id?.toString() || service.name}
              className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50 px-3 py-3 text-base"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{service.name || service.service_name}</span>
                {/* {service.description && (
                  <span className="text-xs text-gray-500 mt-0.5">{service.description}</span>
                )} */}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

ServiceSelector.displayName = "ServiceSelector";

export default ServiceSelector;
