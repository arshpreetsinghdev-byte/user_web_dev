"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronUp, ChevronDown, Check } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PickupLocationField from "./PickupLocationField";
import DestinationField from "./DestinationField";
import ScheduleField from "./ScheduleField";
import ServiceSelector from "./ServiceSelector";
import AddStopButton from "./AddStopButton";
import StopItem from "./StopItem";
import { useBookingForm } from "./useBookingForm";
import { bookingValidator } from "@/lib/validators/bookingValidator";
import { bookingService } from "@/services/booking.service";
import IncrementDecrement from "@/components/IncrementDecrement";
import AutosCouponCard from "@/components/AutosCouponCard";

import { useBookingStore } from "@/stores/booking.store";
import { useUIStore } from "@/stores/ui.store";
import { useFindADrivers } from "@/hooks/useFindADrivers";

const RideBookingForm = ({ className, variant }: { className?: string; variant?: "outline" | "filled" }) => {
  const [mounted, setMounted] = useState(false);
  const [isBookForOtherOpen, setIsBookForOtherOpen] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(true);
  const [couponsOpen, setCouponsOpen] = useState(true);
  const router = useRouter();
  const params = useParams() as { locale?: string };
  const pathname = usePathname() || "";

  const {
    setSelectedRegion,
    setSelectedServices,
    selectedServices,
    setAvailableVehicles,
    selectedService,
    selectedRegion,
    setCurrentStepIndex,
    luggageCount,
    setLuggageCount,
    driverNote,
    setDriverNote,
    flightNumber,
    setFlightNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerCountryCode,
    setCustomerCountryCode,
    allPromotions,
    appliedCoupon,
    setAppliedCoupon,
  } = useBookingStore();
  const { showToast } = useUIStore();
  const { isFinding, calculateFareAndFindDrivers } = useFindADrivers();

  const {
    pickup,
    setPickup,
    destination,
    setDestination,
    stops,
    scheduledDateTime,
    setScheduledDateTime,
    addStop,
    removeStop,
    updateStop,
  } = useBookingForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Book Now button click
  const handleBookNow = useCallback(async () => {
    setSelectedRegion(null);
    setAvailableVehicles([]);
    console.log("validation data:::::::::::", pickup, destination, stops, scheduledDateTime);
    const validation = bookingValidator.validateBookingForm({
      pickup,
      destination,
      stops,
      scheduledDateTime,
    });
    // console.log("validation:::::", validation);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    // Validate config (service area) for pickup, stops and destination
    try {
      const points = [pickup, ...stops, destination].filter(Boolean) as any[];
      for (const p of points) {
        const cfg = await bookingService.fetchConfiguration({ latitude: p.lat ?? p.latitude, longitude: p.lng ?? p.longitude });
        if (cfg?.data?.flag === 144) {
          // bookingService already toasts, but ensure we don't proceed
          return;
        }
      }
    } catch (err) {
      toast.error("Failed to validate service area. Please try again.");
      return;
    }
    console.log("redirecting to the book page");
    try {
      const data = await calculateFareAndFindDrivers();
      // console.log("🚙 Vehicles ready:", data?.regions.vehicles.length);

      const locale = params?.locale || "en";
      router.push(`/${locale}/book`);
    } catch (err) {
      // console.error("❌ Error in handleBookNow:", err);
      showToast("Failed to get quotes. Please try again.", "error");
    }
  }, [
    calculateFareAndFindDrivers,
    destination,
    params?.locale,
    pickup,
    router,
    scheduledDateTime,
    setSelectedRegion,
    setSelectedServices,
    showToast,
    stops,
  ]);

  const handleCalculateFare = useCallback(async () => {
    setSelectedRegion(null);
    setAvailableVehicles([]);
    setCurrentStepIndex(0);

    const validation = bookingValidator.validateBookingForm({
      pickup,
      destination,
      stops,
      scheduledDateTime,
    });

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Validate config (service area) before calculating fare
    try {
      const points = [pickup, ...stops, destination].filter(Boolean) as any[];
      for (const p of points) {
        const cfg = await bookingService.fetchConfiguration({ latitude: p.lat ?? p.latitude, longitude: p.lng ?? p.longitude });
        if (cfg?.data?.flag === 144) {
          return;
        }
      }
    } catch (err) {
      toast.error("Failed to validate service area. Please try again.");
      return;
    }

    try {
      const result = await calculateFareAndFindDrivers();
      toast.success(
        `Found ${result.vehicles.length} vehicles. Route: ${result.route.distanceText}, ${result.route.durationText}`
      );
    } catch (err) {
      toast.error("Failed to calculate fare. Please try again.");
    }
  }, [
    calculateFareAndFindDrivers,
    destination,
    pickup,
    scheduledDateTime,
    setSelectedRegion,
    setSelectedServices,
    stops,
    setCurrentStepIndex,
  ]);

  // Auto-calculate fare when service changes, coupon changes, and we are on the book page
  useEffect(() => {
    if (pathname.includes("/book") && selectedService && pickup?.address && destination?.address) {
      const timer = setTimeout(() => {
        handleCalculateFare();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedService, pickup?.address, destination?.address, handleCalculateFare, pathname, appliedCoupon]);

  const isBookPage = pathname.includes("/book");
  // console.log("is book page::", isBookPage);
  const handleSubmit = isBookPage ? handleCalculateFare : handleBookNow;
  const showAdditionalOptions = showOtherOptions;

  // console.log("selectedService", selectedService?.type)
  return (
    <div
      className={`w-full max-w-105 p-3 lg:p-4 bg-primary rounded-lg lg:rounded-xl flex flex-col ${!isBookPage ? "lg:max-h-125" : ""} ${className}  ${variant === "outline" ? "bg-white border border-border" : ""}`}
    >
      <h2
        className={`text-base lg:text-xl font-semibold text-white mb-2 lg:mb-4 shrink-0 ${variant === "outline" ? "text-black!" : ""}`}
      >
        Book A Ride
      </h2>

      <div className={`flex flex-col flex-1 ${!isBookPage ? "overflow-y-auto" : ""} lg:pr-2 space-y-0.5 lg:space-y-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-white/30`}>
        <PickupLocationField value={pickup} onChange={setPickup} variant={variant} />

        {mounted && (
          <AnimatePresence>
            {stops.map((stop, index) => (
              <StopItem
                key={stop.id}
                stop={stop}
                index={index}
                onUpdate={updateStop}
                onRemove={removeStop}
                variant={variant}
              />
            ))}
          </AnimatePresence>
        )}

        {stops.length < 3 && <AddStopButton onClick={addStop} mounted={mounted} variant={variant} />}

        <DestinationField value={destination} onChange={setDestination} variant={variant} />

        <ScheduleField value={scheduledDateTime} onChange={setScheduledDateTime} variant={variant} />

        <ServiceSelector variant={variant} />

        {/* Other Options Toggle Button */}
        {isBookPage && (
          <Button
            type="button"
            onClick={() => setShowOtherOptions(!showOtherOptions)}
            variant="ghost"
            className={`w-full justify-between h-auto p-3 ${variant === "outline" ? "text-gray-700 hover:bg-gray-50" : "text-white bg-white/10"}`}
          >
            <span className="font-medium">Other Options</span>
            {showOtherOptions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Additional Options - shown when Other Options is toggled */}
        <AnimatePresence initial={false}>
          {showAdditionalOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="bg-[#FCFCFC] rounded-xl p-3 space-y-3">
                {/* Luggage */}
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-sm font-semibold ${variant === "outline" ? "text-gray-900" : "text-gray-900"}`}>
                      Add Luggage
                    </h3>
                    <IncrementDecrement
                      value={luggageCount}
                      onIncrement={() => setLuggageCount(luggageCount + 1)}
                      onDecrement={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                    />
                  </div>
                </div>

                {/* Additional Services (collapsible) */}
                {isBookPage && selectedRegion && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="w-full flex items-center justify-between p-3"
                    >
                      <span className={`text-sm font-semibold ${variant === "outline" ? "text-gray-900" : "text-gray-900"}`}>
                        Additional Services
                      </span>
                      {servicesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {servicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {selectedRegion.vehicle_services && selectedRegion.vehicle_services.length > 0 ? (
                                selectedRegion.vehicle_services.map((svc: any) => (
                                  <label
                                    key={svc.id}
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${variant === "outline"
                                      ? "hover:bg-gray-50"
                                      : "hover:bg-white/5"
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedServices.includes(svc.id)}
                                      onChange={() => {
                                        const updatedServices = selectedServices.includes(svc.id)
                                          ? selectedServices.filter((id) => id !== svc.id)
                                          : [...selectedServices, svc.id];
                                        setSelectedServices(updatedServices);
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className={`text-sm font-medium whitespace-nowrap ${variant === "outline" ? "text-gray-900" : "text-gray-900"
                                      }`}>
                                      {svc.name}
                                    </span>
                                  </label>
                                ))
                              ) : (
                                <p className={`text-sm ${variant === "outline" ? "text-gray-500" : "text-gray-700"
                                  }`}>
                                  No additional services available
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Promotions (collapsible) */}
                {isBookPage && allPromotions.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setCouponsOpen(!couponsOpen)}
                      className="w-full flex items-center justify-between p-3"
                    >
                      <span className={`text-sm font-semibold ${variant === "outline" ? "text-gray-900" : "text-gray-900"}`}>
                        Apply Coupon
                      </span>
                      {couponsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {couponsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <div className="p-3">
                            <div className="flex flex-col gap-2">
                              {allPromotions.map((promo) => {
                                const isAutosCoupon = promo.type === 'autos_coupon';
                                const couponData = isAutosCoupon ? promo.originalData as any : null;

                                if (isAutosCoupon && couponData) {
                                  return (
                                    <AutosCouponCard
                                      key={promo.uniqueKey}
                                      coupon={couponData}
                                      selected={appliedCoupon === promo.id}
                                      onClick={() => {
                                        if (appliedCoupon === promo.id) {
                                          setAppliedCoupon(null);
                                        } else {
                                          setAppliedCoupon(promo.id);
                                        }
                                      }}
                                      variant={variant}
                                      bordered={false}
                                    />
                                  );
                                }

                                return (
                                  <label
                                    key={promo.uniqueKey}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${variant === "outline"
                                      ? "hover:bg-gray-50"
                                      : "hover:bg-white/5"
                                      } ${appliedCoupon === promo.id ? (variant === "outline" ? "bg-primary/5" : "bg-white/20") : ""}`}
                                  >
                                    <input
                                      type="radio"
                                      name="promo"
                                      checked={appliedCoupon === promo.id}
                                      onChange={() => {
                                        if (appliedCoupon === promo.id) {
                                          setAppliedCoupon(null);
                                        } else {
                                          setAppliedCoupon(promo.id);
                                        }
                                      }}
                                      onClick={(e) => {
                                        if (appliedCoupon === promo.id) {
                                          e.preventDefault();
                                          setAppliedCoupon(null);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium ${variant === "outline" ? "text-gray-900" : "text-gray-900"}`}>
                                        {promo.title}
                                      </p>
                                    </div>
                                    {appliedCoupon === promo.id && (
                                      <Check className={`w-4 h-4 ${variant === "outline" ? "text-primary" : "text-gray-900"}`} />
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        className="mt-3 lg:mt-4 shrink-0"
        whileHover={mounted ? { scale: 1.02 } : undefined}
        whileTap={mounted ? { scale: 0.98 } : undefined}
      >
        <Button
          onClick={handleSubmit}
          disabled={isFinding || !pickup?.address || !destination?.address}
          variant="outline"
          className={`w-full h-9 lg:h-10 bg-white text-primary hover:bg-white hover:scale-102 hover:text-primary font-semibold text-sm lg:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${variant === "outline" ? "bg-primary text-white! hover:text-primary!" : ""}`}
        >
          {isFinding ? "Loading..." : isBookPage ? "Calculate Fare" : "Book Now"}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>
    </div>
  );
};

export default RideBookingForm;
