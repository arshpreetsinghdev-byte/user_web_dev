"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RideHistoryItem } from "./HistoryCard";
import { RateRideDialog } from "./RateRideDialog";
import { ModifyRideDialog } from "./ModifyRideDialog";
import { RatedDriverCard } from "./RatedDriverCard";
import { format } from "date-fns";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { mapsService } from "@/lib/google-maps/GoogleMapsService";
import { ChevronRight, Clock, CreditCard, ChevronDown, MapPin, User, Navigation, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleMapsLoaded } from "@/stores/googleMaps.store";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";
import { fetchRideSummary } from "@/lib/api/history.api";
import { mapApiRideToRideHistoryItem } from "@/hooks/useHistory";
import { ApiRideHistoryItem } from "@/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { generateReceiptHTML } from "@/components/ui/ReceiptTemplate";
import { saveAs } from 'file-saver';
import { Download } from "lucide-react";

interface TripDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ride: RideHistoryItem | null;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
};

export function TripDetailsDialog({ open, onOpenChange, ride }: TripDetailsDialogProps) {
    const { t } = useTranslations();
    const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
    const [showDriverDetails, setShowDriverDetails] = useState(false);
    const [detailedRide, setDetailedRide] = useState<RideHistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [routePath, setRoutePath] = useState<{ lat: number; lng: number }[]>([]);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [modifyDialogOpen, setModifyDialogOpen] = useState(false);

    // Use detailed ride if available, otherwise fall back to passed ride prop
    const displayRide = detailedRide || ride;

    useEffect(() => {
        setRoutePath([]); // Reset path when displayRide changes (including when detailedRide updates)
    }, [displayRide]);

    useEffect(() => {
        let active = true;

        const loadSummary = async () => {
            if (!open || !ride) return;

            try {
                // setIsLoading(true);
                // Reset detailed ride when opening a new one, or keep previous if needed? 
                // Better to start fresh or keep 'ride' as placeholder.
                setDetailedRide(null);

                const response = await fetchRideSummary({
                    engagement_id: ride.engagementId || ride.id,
                    product_type: ride.product_type,
                    ride_type: ride.ride_type,
                    locale: "en"
                });

                // if (active && response.data) {
                //     // Assuming response.data is the single ApiRideHistoryItem object
                //     // We cast it because the API response type is generic 'any' currently
                //     const mapped = mapApiRideToRideHistoryItem(response.data as ApiRideHistoryItem);
                //     console.log("ride history mapped", mapped);
                //     setDetailedRide(mapped);
                // }
            } catch (error) {
                console.log("Failed to fetch ride summary:", error);
                toast.error("Failed to fetch ride summary");
            } finally {
                if (active) setIsLoading(false);
            }
        };

        if (open) {
            // loadSummary();
        }

        return () => {
            active = false;
        };
    }, [open, ride]);

    // Use the global store to check if maps are loaded instead of trying to load it again
    const isLoaded = useGoogleMapsLoaded();

    const center = useMemo(() => {
        if (!displayRide) return { lat: 30.7333, lng: 76.7794 }; // Default (Chandigarh)
        return {
            lat: (displayRide.pickupLat + displayRide.dropLat) / 2,
            lng: (displayRide.pickupLng + displayRide.dropLng) / 2,
        };
    }, [displayRide]);

    useEffect(() => {
        if (!displayRide || !isLoaded) return;

        const fetchRoute = async () => {
            try {
                const result = await mapsService.calculateRoute(
                    { lat: displayRide.pickupLat, lng: displayRide.pickupLng },
                    { lat: displayRide.dropLat, lng: displayRide.dropLng }
                );
                if (result && result.path) {
                    setRoutePath(result.path);
                }
            } catch (error) {
                console.log("Failed to fetch route path:", error);
                toast.error("Failed to fetch route path");
            }
        };

        fetchRoute();
    }, [displayRide, isLoaded]);

    // Only use the actual route path, no fallback to straight line
    const path = useMemo(() => {
        return routePath.length > 0 ? routePath : [];
    }, [routePath]);
    // console.log("path lat longs ->",path)
    const handleRatingSubmitted = () => {
        // Refresh the page or refetch data after rating is submitted
        window.location.reload();
    };

    // Operator currency from store
    const operatorCurrency = useOperatorParamsStore(
        state => state.data?.user_web_config?.currency || state.data?.user_web_config?.currency_symbol || '₹'
    );

    const storeLogoUrl = useOperatorParamsStore(
        (state) => state.data.operatorDetails?.[0]?.logo_url || null
    );
    const userWebLogo = useOperatorParamsStore(state => state.data.user_web_config?.logo_url || null);
    const logoUrl = userWebLogo || storeLogoUrl || '/black-badge-assets/ic_launcher.png';

    const handleDownloadReceipt = () => {
        if (!displayRide) return;
        try {
            const html = generateReceiptHTML(displayRide, logoUrl, operatorCurrency);
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            saveAs(blob, `receipt-${displayRide.id}.html`);
            toast.success("Receipt downloaded successfully");
        } catch (error) {
            console.error("Failed to download receipt:", error);
            toast.error("Failed to download receipt");
        }
    };

    if (!displayRide) return null;

    // Animation variants for mobile (slide up from bottom)
    const mobileVariants = {
        hidden: {
            y: "100%",
            opacity: 0
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 30,
                stiffness: 300
            }
        }
    } as const;

    // Animation variants for desktop (scale + fade)
    const desktopVariants = {
        hidden: {
            scale: 0.95,
            opacity: 0
        },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300
            }
        }
    } as const;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 overflow-hidden border-none max-sm:h-full max-sm:max-w-full max-sm:rounded-none sm:max-w-4xl sm:bg-[#F9FAFB]">

                {/* --- MOBILE VIEW (Premium Design) --- */}
                <motion.div
                    key="mobile-dialog"
                    variants={mobileVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex sm:hidden flex-col h-full bg-white overflow-y-auto"
                >
                    {/* Sticky Mobile Header */}
                    <div className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-white shrink-0">
                        <button onClick={() => onOpenChange(false)} className="p-1 -ml-1">
                            <ChevronRight className="h-6 w-6 rotate-180" />
                        </button>
                        <DialogTitle className="text-lg font-bold">{t("Trip details")}</DialogTitle>
                    </div>

                    <div className="flex-1 px-4 py-5 space-y-5">
                        <div className="w-full space-y-5">
                            {/* Map & Basic Info Section */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-3">
                                <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                                    {isLoaded ? (
                                        <GoogleMap
                                            key={`mobile-map-${displayRide.id}`}
                                            mapContainerStyle={mapContainerStyle}
                                            center={center}
                                            zoom={13}
                                            options={mapOptions}
                                        >
                                            <Marker position={{ lat: displayRide.pickupLat, lng: displayRide.pickupLng }} />
                                            <Marker position={{ lat: displayRide.dropLat, lng: displayRide.dropLng }} />
                                            {path.length > 0 && (
                                                <Polyline
                                                    key={`mobile-polyline-${displayRide.id}-${path.length}`}
                                                    path={path}
                                                    options={{
                                                        strokeColor: "var(--primary)",
                                                        strokeOpacity: 1,
                                                        strokeWeight: 4
                                                    }}
                                                />
                                            )}
                                        </GoogleMap>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">Loading Map...</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight">
                                        {displayRide.date && !isNaN(new Date(displayRide.date).getTime())
                                            ? format(new Date(displayRide.date), "h:mm a, EEEE, MMMM d, yyyy")
                                            : "Date unavailable"} {t("with")} {displayRide.driverName}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">{t("Ride ID")}: #{displayRide.id}</p>
                                </div>
                            </div>

                            {/* Rate Your Trip Card - Only for Completed rides */}
                            {displayRide.status === "Completed" && (
                                displayRide.is_rated_before ? (
                                    <RatedDriverCard size="lg" rating={displayRide.driver_rating || 0} />
                                ) : (
                                    <div
                                        onClick={() => setRatingDialogOpen(true)}
                                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                                    >
                                        <div className="space-y-0.5">
                                            <h3 className="font-bold text-gray-900 text-base">{t("Rate Your Trip")}</h3>
                                            <p className="text-sm text-gray-500">{t("Rate Your Trip to share feedback and add tip.")}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                )
                            )}

                            {/* Trip Details Card */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <h3 className="font-bold text-gray-900 text-base">{t("Trip Details")}</h3>
                                <div className="space-y-5">
                                    <div className="relative pl-6 space-y-6">
                                        <div className="absolute left-[7.5px] top-2 bottom-2 w-0.5 border-l-2 border-dotted border-gray-300" />
                                        <div className="relative flex items-center gap-3">
                                            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-green-600 ring-2 ring-white" />
                                            <span className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{displayRide.pickupAddress}</span>
                                        </div>
                                        <div className="relative flex items-center gap-3">
                                            <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-red-600 ring-2 ring-white" />
                                            <span className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{displayRide.dropAddress}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold text-gray-400">{t("Pickup Time")}: {displayRide.date && !isNaN(new Date(displayRide.date).getTime())
                                        ? format(new Date(displayRide.date), "h:mm a")
                                        : "N/A"}</div>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-3">
                                            <Navigation className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-gray-700">{displayRide.distance}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-gray-700">{displayRide.status === "Scheduled" ? t("Scheduled") : displayRide.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-primary font-bold text-lg">{operatorCurrency}</span>
                                            <span className="text-sm font-semibold text-gray-700">{operatorCurrency}{displayRide.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-semibold text-gray-700">{displayRide.paymentMethod}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                        className="w-full flex justify-center items-center gap-2 bg-[#F2F4F7] h-10 rounded-xl"
                                    >
                                        <span className="font-bold text-sm">{t("Price Breakdown")}</span>
                                        <ChevronDown className={`h-4 w-4 transform transition-transform ${showPriceBreakdown ? "rotate-180" : ""}`} />
                                    </button>
                                    {showPriceBreakdown && (
                                        <div className="space-y-3 px-1">
                                            <div className="flex justify-between text-sm"><span>{t("Base Fare")}</span><span className="font-semibold text-gray-900">{operatorCurrency}{(displayRide.price * 0.8).toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm"><span>{t("Taxes")}</span><span className="font-semibold text-gray-900">{operatorCurrency}{(displayRide.price * 0.2).toFixed(2)}</span></div>
                                        </div>
                                    )}

                                    {/* Download Receipt Button - Mobile */}
                                    {displayRide.status === "Completed" && (
                                        <button
                                            onClick={handleDownloadReceipt}
                                            className="w-full flex justify-center items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary h-12 rounded-xl mt-4 border border-primary/20"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span className="font-bold text-sm">{t("Download Receipt")}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Scheduled Ride Booking Details */}
                            {displayRide.status === "Scheduled" && (
                                <>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                        <h3 className="font-bold text-gray-900 text-base">{t("Booking Details")}</h3>

                                        {/* Modify Ride Button */}
                                        <button
                                            onClick={() => setModifyDialogOpen(true)}
                                            className="w-full bg-primary hover:bg-primary/90 text-white p-4 rounded-xl font-semibold transition-colors"
                                        >
                                            {t("Modify Ride")}
                                        </button>

                                        {displayRide.flightNumber && (
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">{t("Flight Number")}:</span>
                                                    <span className="text-sm font-semibold text-blue-900">{displayRide.flightNumber}</span>
                                                </div>
                                            </div>
                                        )}

                                        {displayRide.customerNote && (
                                            <div className="bg-amber-50 rounded-lg p-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-1">{t("Customer Note")}</h4>
                                                <p className="text-sm text-gray-600">{displayRide.customerNote}</p>
                                            </div>
                                        )}

                                        {displayRide.vehicleName && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-gray-600">{t("Vehicle Type")}:</span>
                                                <span className="text-sm font-medium text-gray-900">{displayRide.vehicleName}</span>
                                            </div>
                                        )}

                                        {/* {displayRide.isModifiable && (
                                            <div className="bg-green-50 rounded-lg p-3">
                                                <p className="text-xs text-green-700 text-center">{t("This booking can be modified")}</p>
                                            </div>
                                        )} */}
                                    </div>
                                </>
                            )}

                            {/* Driver Details Card */}
                            {displayRide.driver_id && displayRide.driver_id > 0 && displayRide.status === "Scheduled" && (
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3 mt-4">
                                    <button
                                        onClick={() => setShowDriverDetails(!showDriverDetails)}
                                        className="w-full flex justify-between items-center"
                                    >
                                        <h3 className="font-bold text-gray-900 text-base">
                                            {displayRide.status === "Scheduled" ? t("Accepted Scheduled") : t("Ride Accepted By Driver")}
                                        </h3>
                                        <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showDriverDetails ? "rotate-180" : ""}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showDriverDetails && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-2 text-sm pt-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t("Name")}:</span>
                                                        <span className="font-medium text-gray-900">{displayRide.driverName || displayRide.driver_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t("Phone Number")}:</span>
                                                        <span className="font-medium text-gray-900">{displayRide.driver_number}</span>
                                                    </div>
                                                    {displayRide.driver_vehicle_name && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Name")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_vehicle_name}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.driver_vehicle_brand && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Brand")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_vehicle_brand}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.driver_vehicle_color && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Color")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_vehicle_color}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.vehicle_no && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Number")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.vehicle_no}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.driver_rating && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Driver Rating")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Get Help Card */}
                            {/* <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base">{t("Get Help")}</h3>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div> */}
                        </div>
                    </div>
                </motion.div>

                {/* --- DESKTOP VIEW (Original Design) --- */}
                <motion.div
                    key="desktop-dialog"
                    variants={desktopVariants}
                    initial="hidden"
                    animate="visible"
                    className="hidden sm:flex flex-col h-full bg-[#F9FAFB]"
                >
                    <div className="p-4 border-b bg-white flex justify-between items-center">
                        <DialogTitle className="text-lg font-bold">{t("Trip Details")}</DialogTitle>
                        {/* <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="h-5 w-5" />
                        </button> */}
                    </div>

                    <div className="flex flex-col md:flex-row h-[80vh]">
                        {/* Left Column: Map & Driver Info */}
                        <div className="w-full md:w-3/5 p-4 flex flex-col gap-4 bg-white md:border-r">
                            {/* Map Area */}
                            <div className="relative w-full aspect-square md:aspect-4/5 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                {isLoaded ? (
                                    <GoogleMap
                                        key={`desktop-map-${displayRide.id}`}
                                        mapContainerStyle={mapContainerStyle}
                                        center={center}
                                        zoom={13}
                                        options={mapOptions}
                                    >
                                        <Marker position={{ lat: displayRide.pickupLat, lng: displayRide.pickupLng }} />
                                        <Marker position={{ lat: displayRide.dropLat, lng: displayRide.dropLng }} />
                                        {path.length > 0 && (
                                            <Polyline
                                                key={`desktop-polyline-${displayRide.id}-${path.length}`}
                                                path={path}
                                                options={{
                                                    strokeColor: "var(--primary)",
                                                    strokeOpacity: 1,
                                                    strokeWeight: 4,
                                                }}
                                            />
                                        )}
                                    </GoogleMap>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Loading Map...
                                    </div>
                                )}
                            </div>

                            {/* Bottom Info on Left */}
                            <div className="space-y-1">
                                <div className="font-semibold text-gray-900 text-lg">
                                    {displayRide.date && !isNaN(new Date(displayRide.date).getTime())
                                        ? format(new Date(displayRide.date), "h:mm a, EEEE, MMMM d, yyyy")
                                        : "Date unavailable"} {t("with")}
                                </div>
                                <div className="font-bold text-xl text-gray-800">{displayRide.driverName}</div>
                                <div className="text-sm text-gray-500">{t("Ride ID")}: #{displayRide.id}</div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Details */}
                        <div className="w-full md:w-2/5 p-4 flex flex-col gap-4 bg-[#F9FAFB] overflow-y-auto">

                            {/* Rate Your Trip Card - Only for Completed rides */}
                            {displayRide.status === "Completed" && (
                                displayRide.is_rated_before ? (
                                    <RatedDriverCard size="sm" rating={displayRide.driver_rating || 0} />
                                ) : (
                                    <div
                                        onClick={() => setRatingDialogOpen(true)}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-bold text-gray-900">Rate your Trip</h3>
                                            <p className="text-sm text-gray-500">Rate Your Trip to share feedback and add tip.</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                )
                            )}

                            {/* Trip Details Card */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-2">
                                <h3 className="font-bold text-gray-900">{t("Trip Details")}</h3>

                                {/* Timeline */}
                                <div className="relative pl-4 space-y-8">
                                    {/* Dashed Line */}
                                    <div className="absolute left-[5.5px] top-2 bottom-6 w-0.5 border-l-2 border-dashed border-gray-300" />

                                    {/* Pickup */}
                                    <div className="relative">
                                        <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full bg-green-600 border-2 border-white shadow-sm ring-1 ring-green-600" />
                                        <div className="text-sm font-medium text-gray-900">{displayRide.pickupAddress}</div>
                                    </div>

                                    {/* Drop */}
                                    <div className="relative">
                                        <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full bg-red-600 border-2 border-white shadow-sm ring-1 ring-red-600" />
                                        <div className="text-sm font-medium text-gray-900">{displayRide.dropAddress}</div>
                                    </div>
                                </div>

                                <div className="text-xs font-medium text-gray-500 pt-1">
                                    {t("Pickup Time")}: {displayRide.date && !isNaN(new Date(displayRide.date).getTime())
                                        ? format(new Date(displayRide.date), "h:mm a")
                                        : "N/A"}
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-y-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="p-1.5 bg-primary/10 rounded text-primary">
                                            <Navigation className="h-4 w-4" />
                                        </div>
                                        {displayRide.distance}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="p-1.5 bg-primary/10 rounded text-primary">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        {displayRide.status === "Scheduled" ? t("Scheduled") : displayRide.duration}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="p-1.5 bg-primary/10 rounded text-primary">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        {displayRide.paymentMethod}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="p-1.5 bg-primary/10 rounded text-primary">
                                            {/* Cash Icon/Wallet Icon */}
                                            <span className="text-xs font-bold p-1.5">{operatorCurrency}</span>
                                        </div>
                                        {operatorCurrency}{displayRide.price.toFixed(2)}
                                    </div>
                                </div>

                                {/* Price Breakdown Toggle */}
                                <div className="pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                        className="w-full flex justify-between items-center bg-gray-50 hover:bg-gray-100 h-12 rounded-lg"
                                    >
                                        <span className="font-semibold text-gray-900">{t("Price Breakdown")}</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${showPriceBreakdown ? "rotate-180" : ""}`} />
                                    </Button>
                                    {showPriceBreakdown && (
                                        <div className="p-4 bg-gray-50 mt-1 rounded-lg text-sm space-y-2 text-gray-600">
                                            <div className="flex justify-between">
                                                <span>{t("Base Fare")}</span>
                                                <span>{operatorCurrency}{(displayRide.price * 0.8).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>{t("Taxes")}</span>
                                                <span>{operatorCurrency}{(displayRide.price * 0.2).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                                                <span>{t("Total")}</span>
                                                <span>{operatorCurrency}{displayRide.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Download Receipt Button - Desktop */}
                                {displayRide.status === "Completed" && (
                                    <div className="pt-2">
                                        <Button
                                            onClick={handleDownloadReceipt}
                                            className="w-full flex justify-center items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 h-14 rounded-lg shadow-sm"
                                            variant="ghost"
                                        >
                                            <Download className="h-5 w-5" />
                                            <span className="font-bold">{t("Download Receipt")}</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Scheduled Ride Booking Details - Desktop */}
                            {displayRide.status === "Scheduled" && (
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                    <h3 className="font-bold text-gray-900">{t("Booking Details")}</h3>

                                    {/* Modify Ride Button */}
                                    <button
                                        onClick={() => setModifyDialogOpen(true)}
                                        className="w-full bg-primary hover:bg-primary/90 text-white p-3 rounded-lg font-semibold transition-colors"
                                    >
                                        {t("Modify Ride")}
                                    </button>

                                    {displayRide.flightNumber && (
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">{t("Flight Number")}:</span>
                                                <span className="text-sm font-semibold text-blue-900">{displayRide.flightNumber}</span>
                                            </div>
                                        </div>
                                    )}

                                    {displayRide.customerNote && (
                                        <div className="bg-amber-50 rounded-lg p-3">
                                            <h4 className="text-xs font-medium text-gray-700 mb-1">{t("Customer Note")}</h4>
                                            <p className="text-sm text-gray-600">{displayRide.customerNote}</p>
                                        </div>
                                    )}

                                    {displayRide.vehicleName && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-600">{t("Vehicle Type")}:</span>
                                            <span className="text-sm font-medium text-gray-900">{displayRide.vehicleName}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Driver Details Card - Desktop */}
                            {displayRide.driver_id && displayRide.driver_id > 0 && displayRide.status === "Scheduled" && (
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                    <button
                                        onClick={() => setShowDriverDetails(!showDriverDetails)}
                                        className="w-full flex justify-between items-center"
                                    >
                                        <h3 className="font-bold text-gray-900">
                                            {displayRide.status === "Scheduled" ? t("Accepted Scheduled") : t("Driver Details")}
                                        </h3>
                                        <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showDriverDetails ? "rotate-180" : ""}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showDriverDetails && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-2 text-sm pt-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t("Name")}:</span>
                                                        <span className="font-medium text-gray-900">{displayRide.driverName || displayRide.driver_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t("Phone Number")}:</span>
                                                        <span className="font-medium text-gray-900">{displayRide.driver_number}</span>
                                                    </div>
                                                    {displayRide.driver_vehicle_name && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Name")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_vehicle_name}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.driver_vehicle_brand && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Brand")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_vehicle_brand}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.driver_vehicle_color && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Color")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_vehicle_color}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.vehicle_no && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Vehicle Number")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.vehicle_no}</span>
                                                        </div>
                                                    )}
                                                    {displayRide.driver_rating && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">{t("Driver Rating")}:</span>
                                                            <span className="font-medium text-gray-900">{displayRide.driver_rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Get Help */}
                            {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">{t("Get Help")}</h3>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div> */}

                        </div>
                    </div>
                </motion.div>
            </DialogContent>

            {/* Rate Ride Dialog */}
            <RateRideDialog
                open={ratingDialogOpen}
                onOpenChange={setRatingDialogOpen}
                ride={displayRide}
                onRatingSubmitted={handleRatingSubmitted}
            />

            {/* Modify Ride Dialog */}
            <ModifyRideDialog
                open={modifyDialogOpen}
                onOpenChange={setModifyDialogOpen}
                ride={displayRide}
                onModifySuccess={(updatedRide) => {
                    // Update the detailed ride with modified data
                    setDetailedRide(updatedRide);
                    setModifyDialogOpen(false);
                }}
            />
        </Dialog >
    );
}
