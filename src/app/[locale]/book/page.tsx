"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import RideBookingForm from "@/components/booking/RideBookingForm";
import ActionButton from "@/components/shared/ActionButton";
import HeaderActions from "@/components/shared/HeaderActions";
import { SubRegionCard } from "@/components/SubRegionCard";
import {
  TitleBlock,
  DescriptionBlock,
  PriceBlock,
} from "@/components/SubRegionCard";
import { Card } from "@/components/ui/card";
import { useBookingStore } from "@/stores/booking.store";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import Stepper from "@/components/Stepper";
import CouponPaymentCard from "@/components/CouponPaymentCard";
import { useRouter, useParams } from "next/navigation";
import { getCouponsPromos, type Coupon } from "@/lib/api/coupons";
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/auth/phoneInput";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";
import IncrementDecrement from "@/components/IncrementDecrement";
import { TripTypeToggle } from "@/components/booking/TripTypeToggle";
import { useFindADrivers } from "@/hooks/useFindADrivers";
import ScheduleField from "@/components/booking/ScheduleField";
import { ArrowRight } from "lucide-react";
import RentalPackageSelector from "@/components/booking/RentalPackageSelector";

const VehicleCardSkeleton = () => (
  <div className="flex items-center gap-4 rounded-lg bg-white p-3 ring-1 ring-border shadow-sm h-25">
    <Skeleton className="w-20 h-20 rounded-lg shrink-0 bg-gray-100!" />
    <div className="flex-1 space-y-1">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32 bg-gray-100!" />
        <Skeleton className="h-4 w-16 bg-gray-100!" />
      </div>
      <Skeleton className="h-3 w-full bg-gray-100!" />
      <Skeleton className="h-3 w-2/3 bg-gray-100!" />
    </div>
  </div>
);

const steps = [
  { label: "Enter Details" },
  { label: "Select Car Type" },
  { label: "Payment" },
];

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const {
    availableVehicles,
    selectedRegion,
    setSelectedRegion,
    currentStepIndex,
    setCurrentStepIndex,
    appliedCoupon,
    setAppliedCoupon,
    selectedServices,
    setSelectedServices,
    isLoading,
    selectedService,
    flightNumber,
    setFlightNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerCountryCode,
    setCustomerCountryCode,
    driverNote,
    setDriverNote,
    luggageCount,
    setLuggageCount,
    roundTrip,
    setRoundTrip,
    isInterCityRequest,
    returnDateTime,
    setReturnDateTime,
    scheduledDateTime,
    pickupCityOffset,
  } = useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const { isFinding, calculateFareAndFindDrivers } = useFindADrivers();

  // Determine if the current service is city-to-city (out_station type)
  const isCityToCity = selectedService?.type === 'out_station' || isInterCityRequest;

  // Use available vehicles from store - no fallbacks
  const regions = availableVehicles;
  console.log("Regions fare fix:::", regions);
  const [vehicleServices, setVehicleServices] = useState<{ id: number; name: string; price: number; eta: number; description: string }[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [isMobileFormActive, setIsMobileFormActive] = useState(true);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const hasAutoSelected = useRef(false);

  // Handle trip type toggle (One Way / Round Trip)
  const handleTripTypeToggle = useCallback(async (newValue: 0 | 1) => {
    if (newValue === roundTrip) return;
    setRoundTrip(newValue);
    setSelectedRegion(null);
    // Do NOT reset hasAutoSelected here — the auto-select effect would fire immediately
    // with stale (old-trip) vehicle data before the API returns the new vehicles.
    // We manually re-select after the API resolves instead.

    // If switching to round trip without a return time, set a default (pickup + 24h)
    if (newValue === 1 && !returnDateTime) {
      const baseDate = scheduledDateTime || new Date();
      const defaultReturn = new Date(baseDate);
      defaultReturn.setDate(defaultReturn.getDate() + 1);
      setReturnDateTime(defaultReturn);
    }

    // If switching to one way, clear return time
    if (newValue === 0) {
      setReturnDateTime(null);
    }

    // Re-fetch vehicles with new return_trip value, then re-select first vehicle with fresh fare/package data
    setTimeout(async () => {
      try {
        await calculateFareAndFindDrivers();
        // Read the freshly updated vehicles directly from the store (not stale closure)
        const updatedVehicles = useBookingStore.getState().availableVehicles;
        if (updatedVehicles.length > 0) {
          const region = updatedVehicles[0];
          setSelectedRegion(region);
          const servicesWithEta = (region.vehicle_services || []).map((svc) => ({
            ...svc,
            id: svc.id ?? 0,
            name: svc.name ?? '',
            price: svc.price ?? 0,
            eta: svc.eta ?? 0,
            description: svc.description ?? '',
          }));
          setVehicleServices(servicesWithEta);
          setSelectedServices([]);
          hasAutoSelected.current = true;
        }
      } catch (err) {
        console.error("Failed to refresh vehicles after trip type toggle:", err);
      }
    }, 50);
  }, [roundTrip, setRoundTrip, setSelectedRegion, setSelectedServices, calculateFareAndFindDrivers, returnDateTime, scheduledDateTime, setReturnDateTime]);

  // Handle return time change
  const handleReturnTimeChange = useCallback(async (date: Date | null) => {
    setReturnDateTime(date);
    // Re-fetch fares with updated return time
    setTimeout(async () => {
      try {
        await calculateFareAndFindDrivers();
      } catch (err) {
        console.error("Failed to refresh vehicles after return time change:", err);
      }
    }, 50);
  }, [setReturnDateTime, calculateFareAndFindDrivers]);

  // Fetch coupons on mount
  // useEffect(() => {
  //   const fetchCoupons = async () => {
  //     setIsLoadingCoupons(true);
  //     try {
  //       const fetchedCoupons = await getCouponsPromos();
  //       setCoupons(fetchedCoupons);
  //     } catch (error) {
  //       console.log('Error fetching coupons:', error);
  //       setCoupons([]);
  //     } finally {
  //       setIsLoadingCoupons(false);
  //     }
  //   };
  //   fetchCoupons();
  // }, []);

  // Auto-advance from step 0 to step 1 when vehicles are available
  useEffect(() => {
    if (currentStepIndex === 0 && availableVehicles.length > 0) {
      setCurrentStepIndex(1);
    }
  }, [availableVehicles, currentStepIndex, setCurrentStepIndex]);

  // Auto-select first vehicle by default without scrolling
  useEffect(() => {
    if (regions.length > 0 && !selectedRegion && currentStepIndex === 1 && !hasAutoSelected.current) {
      handleRegionSelect(regions[0].region_id, false);
      hasAutoSelected.current = true;
    }
  }, [regions, selectedRegion, currentStepIndex]);

  // Reset auto-selection flag when going back to step 0
  useEffect(() => {
    if (currentStepIndex === 0) {
      hasAutoSelected.current = false;
    }
  }, [currentStepIndex]);

  const subProgress = useMemo(() => {
    if (currentStepIndex === 1) {
      // Step 1: Show progress when vehicle is selected
      return selectedRegion ? 450 : 150;
    }
    return 0;
  }, [currentStepIndex, selectedRegion]);

  // Target view for the right panel list
  const targetView = useMemo<"regions" | "coupons">(() => {
    if (currentStepIndex === 1) return "regions";
    if (currentStepIndex === 2) return "coupons";
    return "regions"; // default for step 0
  }, [currentStepIndex]);

  // Simple fade swap (opacity only)
  const [renderView, setRenderView] = useState<"regions" | "coupons">(
    targetView
  );
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (renderView === targetView) return;

    setVisible(false);
    const t = window.setTimeout(() => {
      setRenderView(targetView);
      // next paint => fade in
      requestAnimationFrame(() => setVisible(true));
    }, 140);

    return () => window.clearTimeout(t);
  }, [targetView, renderView]);

  const handleRegionSelect = (regionId: number, shouldScroll: boolean = true) => {
    const region = regions.find((r) => r.region_id === regionId);
    if (region) {
      setSelectedRegion(region);
      // console.log("[handleRegionSelect] Selected vehicle:", {
      //   region_id: region.region_id,
      //   region_name: region.region_name,
      //   vehicle_type: region.vehicle_type,
      //   ride_type: region.ride_type,
      //   fare: {
      //     fare_float: region.region_fare?.fare_float,
      //     original_fare_float: region.region_fare?.original_fare_float,
      //     currency_symbol: region.region_fare?.currency_symbol,
      //     pool_fare_id: region.region_fare?.pool_fare_id,
      //     package_id: region.region_fare?.package_id,
      //     applicable_fare: region.region_fare?.applicable_fare,
      //   },
      //   packages: region.packages,
      // });
      const servicesWithEta = (region.vehicle_services || []).map((svc) => ({
        ...svc,
        id: svc.id ?? 0,
        name: svc.name ?? '',
        price: svc.price ?? 0,
        eta: svc.eta ?? 0,
        description: svc.description ?? '',
      }));
      setVehicleServices(servicesWithEta);
      setSelectedServices([]);

      // Scroll to booking details section only when manually selected and no packages (hourly/rental)
      if (shouldScroll && !((region.packages?.length ?? 0) > 0)) {
        setTimeout(() => {
          const bookingDetailsSection = document.getElementById('booking-details-section');
          if (bookingDetailsSection) {
            bookingDetailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  const toggleService = (serviceId: number) => {
    const updatedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(updatedServices);
  };

  const handleCouponApply = (couponId: number | null) => {
    if (couponId === appliedCoupon) {
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(couponId);
  }

  const handleStepChange = useCallback((nextStep: number) => {
    // Step 0 (Enter Details): Clear selected vehicle and show form on mobile
    if (nextStep === 0) {
      setSelectedRegion(null);
      setCurrentStepIndex(0);
      // On mobile, show the form
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsMobileFormActive(true);
      }
      return;
    }

    // Step 1 (Select Car Type): Just set the step
    if (nextStep === 1) {
      setCurrentStepIndex(1);
      return;
    }

    // Step 2 (Payment): Navigate to ride-summary (like Next button)
    if (nextStep === 2) {
      if (!selectedRegion) {
        toast.error('Please select a vehicle first', { id: 'no-vehicle' });
        return;
      }

      // Validate pickup date/time is selected
      if (!scheduledDateTime) {
        toast.error('Please select a pickup date and time', { id: 'no-datetime' });
        return;
      }

      // Validate flight number for airport rides
      if (selectedService?.type === "airport_taxi" && !flightNumber.trim()) {
        toast.error('Flight number is required for airport rides', { id: 'no-flight-number' });
        return;
      }

      if (!isAuthenticated) {
        openAuthModal();
        return;
      }

      router.push(`/${locale}/ride-summary`);
      return;
    }

    setCurrentStepIndex(nextStep);
  }, [selectedRegion, locale, router, setCurrentStepIndex, isAuthenticated, openAuthModal, selectedService, flightNumber, scheduledDateTime, setSelectedRegion, setIsMobileFormActive]);

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && currentStepIndex <= 1 && !isMobileFormActive) {
      setIsMobileFormActive(true);
      return;
    }

    if (currentStepIndex === 1 || currentStepIndex === 0) {
      router.push(`/${locale}/home`);
      return;
    }

    if (currentStepIndex > 1) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex, setCurrentStepIndex, isMobileFormActive, locale, router]);

  const onNext = useCallback(() => {
    // Always validate date/time first, regardless of step or mobile state
    if (!scheduledDateTime) {
      toast.error('Please select a pickup date and time', { id: 'no-datetime' });
      return;
    }

    if (typeof window !== "undefined" && window.innerWidth < 768 && currentStepIndex <= 1 && isMobileFormActive) {
      setIsMobileFormActive(false);
      return;
    }

    // Step 0: user somehow clicked Next without vehicles loaded yet
    if (currentStepIndex === 0) {
      return;
    }

    // Step 1: Select Car Type -> Step 2: Payment (ride-summary)
    if (currentStepIndex === 1) {
      if (!selectedRegion) {
        toast.error('Please select a vehicle to proceed', { id: 'no-vehicle' });
        return;
      }

      // Validate return date/time for round trip city-to-city rides
      if (isCityToCity && roundTrip === 1 && !returnDateTime) {
        toast.error('Please select a return date and time', { id: 'no-return-datetime' });
        return;
      }

      // Validate flight number for airport rides
      if (selectedService?.type === "airport_taxi" && !flightNumber.trim()) {
        toast.error('Flight number is required for airport rides', { id: 'no-flight-number' });
        return;
      }

      if (!isAuthenticated) {
        openAuthModal();
        return;
      }
      router.push(`/${locale}/ride-summary`);
    }
  }, [currentStepIndex, selectedRegion, locale, router, isMobileFormActive, isAuthenticated, selectedService, flightNumber, scheduledDateTime, isCityToCity, roundTrip, returnDateTime]);

  return (
    <section className="relative min-h-[calc(100vh-88px)] pb-20 w-full bg-[#f8f8f8]">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <HeaderActions onBack={onBack} onNext={onNext} />

        <div className="w-full grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] md:grid-cols-[280px_minmax(0,1fr)] gap-6 lg:gap-8 xl:gap-10 items-start">
          <div className={`${isMobileFormActive && currentStepIndex <= 1 ? "block" : "hidden"} md:block w-full lg:min-w-105 lg:max-w-110 md:max-w-70 lg:sticky lg:top-6 space-y-4`}>
            <RideBookingForm className="mx-0! min-w-full" variant="outline" currentStepIndex={currentStepIndex} />
            {/* {selectedRegion && <h2 className="H1">Selected Items</h2>}

            {selectedRegion && (  
              <SelectedItems  
                imgSrc={selectedRegion.images.tab_normal}
                additionalServices={selectedAdditionalServices}
                titleComponent={
                  <TitleBlock
                    title={selectedRegion.region_name}
                    capacity={selectedRegion.max_people}
                  />
                }
                priceComponent={
                  <PriceBlock
                    currencySymbol={selectedRegion.region_fare?.currency_symbol || "₹"}
                    price={selectedRegion.region_fare?.fare_float}
                    oldPrice={
                      selectedRegion.region_fare?.original_fare_float !==
                        selectedRegion.region_fare?.fare_float
                        ? selectedRegion.region_fare?.original_fare_float
                        : undefined
                    }
                  />
                }
              />
            )} */}
          </div>

          <div className={`w-full ${isMobileFormActive && currentStepIndex <= 1 ? "hidden md:block" : "block"}`}>
            <Card className="items-center mb-6 max-sm:-px-1">
              <Stepper
                steps={steps}
                currentStep={currentStepIndex}
                subProgress={subProgress}
                onStepChange={handleStepChange}
              />
            </Card>

            <Card className="px-6 max-sm:border-none max-sm:shadow-none max-sm:px-1">
              <div className="flex justify-between items-center">
                <h2 className="H2">
                  {currentStepIndex === 0 ? "Complete the form to continue" :
                    currentStepIndex === 1 ? "Choose a ride" :
                      "Coupons & Promotions"}
                </h2>
              </div>

              {/* One Way / Round Trip toggle for city-to-city rides */}
              {currentStepIndex === 1 && isCityToCity && (
                <div className="mt-2 mb-1 space-y-3">
                  <TripTypeToggle
                    value={roundTrip}
                    onChange={handleTripTypeToggle}
                    disabled={isFinding || isLoading}
                  />

                  {/* Pickup & Return time display for city-to-city */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Booking for:</span>
                    <span>
                      {scheduledDateTime
                        ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(scheduledDateTime))
                        : 'Select Pickup Time'}
                    </span>
                    {roundTrip === 1 && (
                      <>
                        <span className="text-gray-400">—</span>
                        <div className="flex-1">
                          <ScheduleField
                            value={returnDateTime}
                            onChange={handleReturnTimeChange}
                            variant="outline"
                            className="h-8 text-xs"
                            pickupCityOffset={pickupCityOffset}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div
                className={`overflow-y-auto max-h-150 space-y-3
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1
                  transition-opacity duration-200 ease-in-out will-change-[opacity] max-sm:max-h-full ${visible ? "opacity-100" : "opacity-0"
                  }`}
              >
                {currentStepIndex === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">Fill in your pickup and destination details on the left to get started</p>
                  </div>
                ) : currentStepIndex === 1 ? (
                  isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <VehicleCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : regions.length > 0 ? (
                    regions.map((region) => {
                      const hasPackages = (region.packages?.length ?? 0) > 0;
                      const isSelected = selectedRegion?.region_id === region.region_id;
                      return (
                        <SubRegionCard
                          key={region.region_id}
                          imgSrc={region.images.tab_normal}
                          selected={isSelected}
                          expanded={isSelected && hasPackages}
                          onClick={() => handleRegionSelect(region.region_id)}
                          className=""
                          subComponent1={
                            <TitleBlock
                              title={region.region_name}
                              capacity={region.max_people}
                            />
                          }
                          subComponent2={
                            <PriceBlock
                              currencySymbol={useOperatorParamsStore.getState().data?.user_web_config?.currency || useOperatorParamsStore.getState().data?.user_web_config?.currency_symbol || region.region_fare?.currency_symbol || "₹"}
                              price={isSelected && selectedRegion ? selectedRegion.region_fare?.fare_float : region.region_fare?.fare_float}
                              oldPrice={
                                region.region_fare?.original_fare_float !==
                                  region.region_fare?.fare_float
                                  ? region.region_fare?.original_fare_float
                                  : undefined
                              }
                            />
                          }
                          subComponent3={
                            <DescriptionBlock
                              text={
                                region.description ||
                                region.disclaimer_text ||
                                `Book a ${region.region_name} for your ride`
                              }
                            />
                          }
                          expandContent={
                            hasPackages ? (
                              <RentalPackageSelector region={isSelected && selectedRegion ? selectedRegion : region} />
                            ) : undefined
                          }
                        />
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-muted-foreground mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No vehicles available</h3>
                      <p className="text-sm text-muted-foreground">Please enter pickup and destination to find available rides</p>
                    </div>
                  )
                ) : (
                  // Show coupons on step 1
                  <>
                    {isLoadingCoupons ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Loading coupons...</p>
                      </div>
                    ) : coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <CouponPaymentCard
                          key={coupon.id}
                          imgUrl="/offer.png"
                          title={coupon.code}
                          subtitle={coupon.description}
                          onClick={() => handleCouponApply(coupon.id)}
                          selected={appliedCoupon === coupon.id}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
                        <p>No coupons available at the moment</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>

            {/* Vehicle Services Section - shown on step 1 after vehicle selection */}
            {currentStepIndex === 1 && selectedRegion && (
              <Card className="px-6 mt-6 max-sm:border-none max-sm:shadow-none max-sm:px-1" id="vehicle-services-section">
                {/* Header with Additional Services title and Luggage */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="H2">Additional Services</h2>
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Add Luggage</span>
                      <IncrementDecrement
                        value={luggageCount}
                        onIncrement={() => setLuggageCount(luggageCount + 1)}
                        onDecrement={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                      />
                    </div>
                    {selectedRegion?.region_fare?.applicable_fare?.fare_per_baggage !== undefined && 
                     selectedRegion.region_fare.applicable_fare.fare_per_baggage > 0 && (
                      <span className="text-xs text-red-500 font-medium">
                        * {useOperatorParamsStore.getState().data?.user_web_config?.currency || '₹'}{selectedRegion.region_fare.applicable_fare.fare_per_baggage} per bag
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-1">
                  {vehicleServices.length > 0 ? (
                    vehicleServices.map((svc) => (
                      <label
                        key={svc.id}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(svc.id)}
                          onChange={() => toggleService(svc.id)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {svc.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-2 text-muted-foreground border-none w-full">
                      <p>No additional services available for this vehicle</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Booking Details - shown on step 1 after vehicle selection */}
            {currentStepIndex === 1 && selectedRegion && (
              <>
                <Card className="px-4 sm:px-6 mt-6 max-sm:border-none max-sm:shadow-none max-sm:px-1" id="booking-details-section">
                  <h2 className="H2 mb-3 text-base sm:text-lg">Booking Details</h2>
                  <div className="space-y-4">
                    {/* Book for someone else - Accordion */}
                    <div className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setIsBookingDetailsOpen(!isBookingDetailsOpen)}
                        className="w-full flex items-center justify-between px-5 py-2 sm:px-5 sm-py-2 text-left hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Book for someone else (Optional)</h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isBookingDetailsOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isBookingDetailsOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                          }`}
                      >
                        <div className="px-4 pb-4 space-y-1  mt-1">
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Passenger name"
                              className="w-full sm:w-[40%] p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <div className="w-full sm:w-[55%]">
                              <PhoneInput
                                phoneNumber={customerPhone}
                                countryCode={customerCountryCode || 'US'}
                                onPhoneNumberChange={setCustomerPhone}
                                onCountryCodeChange={setCustomerCountryCode}
                                placeholder="Passenger phone number"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flight Number - only for airport taxi */}
                    {selectedService?.type === "airport_taxi" && (
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1">
                          Flight Number
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          placeholder="e.g., AA123"
                          maxLength={20}
                          className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Driver Note - Below Booking Details */}
                <Card className="px-4 sm:px-6 mt-6 max-sm:border-none max-sm:shadow-none max-sm:px-1">
                  <h2 className="H2 mb-3 text-base sm:text-lg">Note For Driver</h2>
                  <div className="space-y-2">
                    <textarea
                      value={driverNote}
                      onChange={(e) => setDriverNote(e.target.value)}
                      placeholder="Write here..."
                      maxLength={500}
                      rows={3}
                      className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                    />
                    <p className="text-xs sm:text-sm text-gray-500 text-right">
                      {driverNote.length}/500
                    </p>
                  </div>
                </Card>

                {/* Next Button - Desktop only, bottom of right column, aligned to right */}
                {selectedRegion && currentStepIndex === 1 && (
                  <div className="hidden md:flex justify-end mt-6">
                    <ActionButton onClick={onNext} className="px-8 py-3 text-base justify-center flex h-12 bg-primary hover:bg-primary/90 shadow-lg rounded-lg">
                      {"Next"}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </ActionButton>
                  </div>
                )}
              </>
            )}

            {/* Vehicle Services Section moved - now under Additional Services below */}


            {/* {(currentStepIndex >= 1 && selectedRegion) && (
              <div className="md:hidden">
                {selectedRegion && <h2 className="H1 my-4 max-sm:text-xl!">Selected Items</h2>}
                <SelectedItems
                  imgSrc={selectedRegion.images.tab_normal}
                  additionalServices={selectedAdditionalServices}
                  titleComponent={
                    <TitleBlock
                      title={selectedRegion.region_name}
                      capacity={selectedRegion.max_people}
                    />
                  }
                  priceComponent={
                    <PriceBlock
                      currencySymbol={selectedRegion.region_fare?.currency_symbol || "₹"}
                      price={selectedRegion.region_fare?.fare_float}
                      oldPrice={
                        selectedRegion.region_fare?.original_fare_float !==
                          selectedRegion.region_fare?.fare_float
                          ? selectedRegion.region_fare?.original_fare_float
                          : undefined
                      }
                    />
                  }
                />
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Desktop hanging sticky button - removed - now inside Card */}
      {/* {selectedRegion && (
        <div className="hidden sm:block fixed bottom-20 right-6 z-10">
          <ActionButton onClick={onNext} className="px-8 py-3 text-base justify-center flex h-12 bg-primary hover:bg-primary/90 shadow-lg rounded-lg">
            {"Next"}
          </ActionButton>
        </div>
      )} */}

      <div className="fixed bottom-0 left-0 right-0 z-10 w-full py-3 px-4 block sm:hidden bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        <ActionButton onClick={onNext} className="w-[90%] px-2 text-lg justify-center mx-auto flex h-9.50!">
          {"Next"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </ActionButton>
      </div>
    </section>
  );
}
