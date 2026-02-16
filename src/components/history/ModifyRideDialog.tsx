"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RideHistoryItem } from "./HistoryCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { modifyScheduledRide } from "@/lib/api/history.api";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { mapsService } from "@/lib/google-maps/GoogleMapsService";
import { useGoogleMapsLoaded } from "@/stores/googleMaps.store";
import type { PlaceResult } from "@/types";

interface ModifyRideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ride: RideHistoryItem | null;
    onModifySuccess?: (updatedRide: RideHistoryItem) => void;
}

export function ModifyRideDialog({ open, onOpenChange, ride, onModifySuccess }: ModifyRideDialogProps) {
    const { t } = useTranslations();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isGoogleMapsLoaded = useGoogleMapsLoaded();

    // Refs for input elements
    const pickupInputRef = useRef<HTMLInputElement>(null);
    const dropInputRef = useRef<HTMLInputElement>(null);

    // Form state - initialize with ride data
    const [pickupAddress, setPickupAddress] = useState(ride?.pickupAddress || "");
    const [dropAddress, setDropAddress] = useState(ride?.dropAddress || "");
    const [pickupLat, setPickupLat] = useState(ride?.pickupLat || 0);
    const [pickupLng, setPickupLng] = useState(ride?.pickupLng || 0);
    const [dropLat, setDropLat] = useState(ride?.dropLat || 0);
    const [dropLng, setDropLng] = useState(ride?.dropLng || 0);
    const [pickupTime, setPickupTime] = useState(() => {
        if (!ride?.date) return "";
        const date = new Date(ride.date);
        // Format as datetime-local input value (YYYY-MM-DDTHH:mm)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    });
    const [customerNote, setCustomerNote] = useState(ride?.customerNote || "");
    const [flightNumber, setFlightNumber] = useState(ride?.flightNumber || "");
    // Only show flight number for airport rides (type 4)
    // console.log("ride type::::", ride);
    const isAirportRide = ride && (ride.ride_type === 11 || ride.product_type === 11);

    // Handle pickup address selection from Google Maps
    const handlePickupPlaceSelect = useCallback((place: PlaceResult) => {
        setPickupAddress(place.address);
        setPickupLat(place.lat);
        setPickupLng(place.lng);
        console.log('✅ Pickup location selected:', place);
    }, []);

    // Handle drop address selection from Google Maps
    const handleDropPlaceSelect = useCallback((place: PlaceResult) => {
        setDropAddress(place.address);
        setDropLat(place.lat);
        setDropLng(place.lng);
        console.log('✅ Drop location selected:', place);
    }, []);

    // Setup autocomplete when dialog opens and Google Maps is loaded
    useEffect(() => {
        if (!open || !isGoogleMapsLoaded) {
            console.log('⏸️ Waiting for dialog open and Google Maps loaded', { open, isGoogleMapsLoaded });
            return;
        }

        // Wait a bit for inputs to be rendered
        const timer = setTimeout(() => {
            let pickupCleanup: (() => void) | null = null;
            let dropCleanup: (() => void) | null = null;

            if (pickupInputRef.current) {
                console.log('🔧 Setting up pickup autocomplete');
                pickupCleanup = mapsService.setupAutocomplete(
                    pickupInputRef.current,
                    handlePickupPlaceSelect
                );
                console.log('✅ Pickup autocomplete setup complete');
            } else {
                console.log('❌ Pickup input ref not found');
            }

            if (dropInputRef.current) {
                console.log('🔧 Setting up drop autocomplete');
                dropCleanup = mapsService.setupAutocomplete(
                    dropInputRef.current,
                    handleDropPlaceSelect
                );
                console.log('✅ Drop autocomplete setup complete');
            } else {
                console.log('❌ Drop input ref not found');
            }

            // Cleanup function
            return () => {
                console.log('🧹 Cleaning up autocomplete');
                if (pickupCleanup) pickupCleanup();
                if (dropCleanup) dropCleanup();
            };
        }, 200);

        return () => clearTimeout(timer);
    }, [open, isGoogleMapsLoaded, handlePickupPlaceSelect, handleDropPlaceSelect]);

    const handleSubmit = async () => {
        if (!ride) {
            toast.error(t("Please fill all required fields"));
            return;
        }
        if (!pickupTime || pickupTime.trim() === "") {
            toast.error(t("Pickup date/time cannot be empty"));
            return;
        }
        if (!pickupAddress || pickupAddress.trim() === "") {
            toast.error(t("Pickup address cannot be empty"));
            return;
        }
        if (!dropAddress || dropAddress.trim() === "") {
            toast.error(t("Drop address cannot be empty"));
            return;
        }

        // Validate that coordinates are set
        if (pickupLat === 0 && pickupLng === 0) {
            toast.error(t("Please select a valid pickup location"));
            return;
        }

        if (dropLat === 0 && dropLng === 0) {
            toast.error(t("Please select a valid drop location"));
            return;
        }

        // Validate that pickup and drop locations are not the same
        if (pickupAddress.trim().toLowerCase() === dropAddress.trim().toLowerCase() || 
            (pickupLat === dropLat && pickupLng === dropLng)) {
            toast.error(t("Pickup and destination cannot be the same"));
            return;
        }

        try {
            setIsSubmitting(true);

            // Convert datetime-local to milliseconds
            const dateObj = new Date(pickupTime);
            const pickupTimeMs = dateObj.getTime().toString();

            const reqBody: any = {
                pickup_id: Number(ride.pickupId) || 0,
                pool_fare_id: Number(ride.poolFareId) || 0,
                pickup_latitude: pickupLat,
                pickup_longitude: pickupLng,
                pickup_address: pickupAddress,
                pickup_time: pickupTimeMs,
                drop_latitude: dropLat,
                drop_longitude: dropLng,
                drop_address: dropAddress,
                preferred_payment_mode: Number(ride.paymentModeId) || 1,
            };
            if (isAirportRide) {
                reqBody.flight_number = flightNumber;
            }
            if (customerNote && customerNote.trim() !== "") {
                reqBody.customer_note = customerNote;
            }
            await modifyScheduledRide(reqBody);

            toast.success(t("Ride modified successfully"));
            
            // Build updated ride object with new data
            const updatedRide: RideHistoryItem = {
                ...ride,
                pickupAddress,
                dropAddress,
                pickupLat,
                pickupLng,
                dropLat,
                dropLng,
                customerNote,
                flightNumber,
                date: new Date(pickupTime).toISOString(),
            };
            
            onModifySuccess?.(updatedRide);
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to modify ride:", error);
            toast.error(error?.message || t("Failed to modify ride"));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when ride changes or dialog opens
    useEffect(() => {
        if (open && ride) {
            setPickupAddress(ride.pickupAddress);
            setDropAddress(ride.dropAddress);
            setPickupLat(ride.pickupLat);
            setPickupLng(ride.pickupLng);
            setDropLat(ride.dropLat);
            setDropLng(ride.dropLng);
            setCustomerNote(ride.customerNote || "");
            // Only set flight number for airport rides (type 11)
            if (ride.ride_type === 11 || ride.product_type === 11) {
                setFlightNumber(ride.flightNumber || "");
            } else {
                setFlightNumber("");
            }
            const date = new Date(ride.date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            setPickupTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
    }, [open, ride]);

    if (!ride) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-125 max-w-[calc(100%-2rem)] p-0 gap-0"
                onInteractOutside={(event) => {
                    // Prevent dialog from closing when clicking on Google Maps autocomplete dropdown
                    if ((event.target as Element).closest('.pac-container')) {
                        event.preventDefault();
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-xl font-bold">{t("Modify Scheduled Ride")}</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto" key={open ? 'open' : 'closed'}>
                        {/* Pickup Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                {t("Pickup Time")} *
                            </label>
                            <Input
                                type="datetime-local"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>
                        {/* Flight Number (only for airport rides) */}
                        {isAirportRide && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    {t("Flight Number")}
                                </label>
                                <Input
                                    type="text"
                                    value={flightNumber}
                                    onChange={(e) => setFlightNumber(e.target.value)}
                                    placeholder={t("Enter flight number (if any)")}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Pickup Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                {t("Pickup Address")} *
                            </label>
                            <Input
                                ref={pickupInputRef}
                                type="text"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                placeholder={t("Enter or select pickup address")}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Drop Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                {t("Drop Address")} *
                            </label>
                            <Input
                                ref={dropInputRef}
                                type="text"
                                value={dropAddress}
                                onChange={(e) => setDropAddress(e.target.value)}
                                placeholder={t("Enter or select drop address")}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* Customer Note */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                {t("Customer Note")}
                            </label>
                            <Textarea
                                value={customerNote}
                                onChange={(e) => setCustomerNote(e.target.value)}
                                placeholder={t("Add any special instructions...")}
                                className="w-full min-h-[80px]"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 p-6 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !pickupTime}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {t("Saving...")}
                                </>
                            ) : (
                                t("Save Changes")
                            )}
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
