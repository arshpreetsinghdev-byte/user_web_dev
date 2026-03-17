"use client";

import { useState, useCallback } from "react";
import { Info, X } from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "@/services/booking.service";
import { useBookingStore } from "@/stores/booking.store";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";
import type { VehiclePackage, VehicleRegion } from "@/types";

interface RentalPackageSelectorProps {
  region: VehicleRegion;
}

function FareBreakdownModal({ pkg, currency, onClose }: { pkg: VehiclePackage; currency: string; onClose: () => void }) {
  const rows: { label: string; value: string }[] = [];

  if (pkg.fare_fixed > 0) rows.push({ label: "Base Fare", value: `${currency}${pkg.fare_fixed}` });
  if (pkg.fare_per_km > 0) rows.push({ label: "Per km", value: `${currency}${pkg.fare_per_km}` });
  else rows.push({ label: "Per mile", value: `${currency}0` });
  if (pkg.fare_per_min > 0) rows.push({ label: "Per Min", value: `${currency}${pkg.fare_per_min}` });
  if (pkg.fare_minimum > 0) rows.push({ label: "Minimum Fare", value: `${currency}${pkg.fare_minimum}` });
  if (pkg.fare_per_baggage > 0) rows.push({ label: "Per Baggage", value: `${currency}${pkg.fare_per_baggage}` });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">
            {pkg.package_name}
          </p>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between py-2 text-sm">
              <span className="text-gray-600">{row.label}</span>
              <span className="font-medium text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RentalPackageSelector({ region }: RentalPackageSelectorProps) {
  const [isEstimating, setIsEstimating] = useState(false);
  const [infoPackageId, setInfoPackageId] = useState<number | null>(null);

  const {
    selectedPackage,
    setSelectedPackage,
    pickup,
    dropoff,
    selectedService,
    routeDistance,
    routeDuration,
    setSelectedRegion,
  } = useBookingStore();

  const packages = region.packages || [];
  if (packages.length === 0) return null;

  const currency =
    useOperatorParamsStore.getState().data?.user_web_config?.currency ||
    useOperatorParamsStore.getState().data?.user_web_config?.currency_symbol ||
    region.region_fare?.currency_symbol ||
    "₹";

  const handlePackageSelect = useCallback(
    async (pkg: VehiclePackage) => {
      if (selectedPackage?.package_id === pkg.package_id) return;

      setSelectedPackage(pkg);
      setIsEstimating(true);

      try {
        const body = new URLSearchParams();
        body.set("ride_distance", String((routeDistance ?? 0) / 1000));
        body.set("ride_time", String((routeDuration ?? 0) / 60));
        body.set("is_pooled", "0");
        body.set("region_id", String(region.region_id));
        body.set("vehicle_type", String(region.vehicle_type));
        body.set("package_id", String(pkg.package_id));
        body.set("ride_type", String(region.ride_type));
        body.set("show_toll_charge", "1");
        body.set("start_longitude", String(pickup?.lng ?? 0));
        body.set("start_latitude", String(pickup?.lat ?? 0));
        body.set("end_latitude", String(dropoff?.lat ?? 0));
        body.set("end_longitude", String(dropoff?.lng ?? 0));
        if (selectedService?.id) {
          body.set("service_id", String(selectedService.id));
        }
        body.set("return_trip", String(pkg.return_trip ?? 0));

        const result = await bookingService.getFareEstimate(body);

        if (result?.flag === "SUCCESS" || result?.data) {
          const fareData = result.data;
          const approxFare = fareData.approx_fare;
          const updatedRegion = {
            ...region,
            region_fare: {
              ...region.region_fare,
              fare_float: approxFare ?? region.region_fare.fare_float,
              original_fare_float: approxFare ?? region.region_fare.original_fare_float,
              fare: approxFare ?? region.region_fare.fare,
              original_fare: approxFare ?? region.region_fare.original_fare,
              package_id: fareData.package_id ?? pkg.package_id,
              pool_fare_id: fareData.pool_fare_id ?? region.region_fare.pool_fare_id,
              convenience_charge: fareData.convenience_charge ?? region.region_fare.convenience_charge,
            },
          };
          setSelectedRegion(updatedRegion as VehicleRegion);
        }
      } catch (err) {
        toast.error("Failed to get fare estimate for this package.");
      } finally {
        setIsEstimating(false);
      }
    },
    [region, selectedPackage, pickup, dropoff, routeDistance, routeDuration, selectedService, setSelectedPackage, setSelectedRegion]
  );

  const activePackageId = selectedPackage?.package_id ?? region.region_fare?.package_id;

  return (
    <div className="relative">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Packages</h3>
      <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {packages.map((pkg) => {
          const isActive = activePackageId === pkg.package_id;
          return (
            <div
              key={pkg.package_id}
              className={`relative shrink-0 w-36 rounded-xl border-2 flex flex-col justify-between p-3.5 cursor-pointer transition-all duration-150 select-none
                ${isActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
                }
                ${isEstimating ? "opacity-60 cursor-wait" : ""}
              `}
              onClick={(e) => { e.stopPropagation(); handlePackageSelect(pkg); }}
            >
              {/* Package name */}
              <p className={`text-xs font-semibold leading-tight line-clamp-3 ${isActive ? "text-primary" : "text-gray-800"}`}>
                {pkg.package_name || `Package ${pkg.package_id}`}
              </p>

              {/* Base fare + info button row */}
              <div className="flex items-end justify-between mt-2">
                <p className={`text-sm font-bold ${isActive ? "text-primary" : "text-gray-700"}`}>
                  {currency}{pkg.fare_fixed}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setInfoPackageId(infoPackageId === pkg.package_id ? null : pkg.package_id); }}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                    ${isActive
                      ? "border-primary text-primary hover:bg-primary/10"
                      : "border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                    }
                  `}
                >
                  <Info size={10} />
                </button>
              </div>
              {/* Fare breakdown modal */}
              {infoPackageId === pkg.package_id && (
                <FareBreakdownModal
                  pkg={pkg}
                  currency={currency}
                  onClose={() => setInfoPackageId(null)}
                />
              )}
            </div>
          );
        })}
      </div>
      {isEstimating && (
        <p className="text-xs text-gray-500 mt-1 animate-pulse">Calculating fare...</p>
      )}
    </div>
  );
}
