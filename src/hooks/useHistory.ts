import { useState, useEffect, useMemo, useCallback } from "react";
import axios from 'axios';
import { RideHistoryItem, RideStatus } from "../components/history/HistoryCard";
import { useAuthStore } from "@/stores/auth.store";
import { ApiRideHistoryItem } from "@/types";
import { fetchRideHistory } from "@/lib/api/history.api";
import { toast } from "sonner";

const TABS = ["All", "Scheduled", "Completed", "Cancelled"] as const;
export type TabType = typeof TABS[number];

// Map API response to UI model
export const mapApiRideToRideHistoryItem = (apiRide: ApiRideHistoryItem): RideHistoryItem => {
    let status: RideStatus = "Completed";
    const isScheduled = apiRide.is_upcoming_ride == 1 || apiRide.is_upcoming_ride === "1";

    // Mapping status based on common Jugnoo flags
    if (isScheduled) {
        status = "Scheduled";
    } else if (apiRide.is_cancelled_ride === 1) {
        status = "Cancelled";
    } else if (apiRide.autos_status === 1) {
        status = "Scheduled";
    } else if (apiRide.autos_status === 3 || apiRide.autos_status === 5) {
        status = "Completed";
    }
    let statusMessage: string = status;
    if (status === "Cancelled" && apiRide.autos_status === 5) {
        statusMessage = "Missed Schedule";
    } else if (isScheduled && apiRide.driver_id && apiRide.driver_id > 0) {
        statusMessage = "Driver Accepted";
    }
    const pickupAddr = apiRide.pickup_location_address || apiRide.pickup_address;
    const dropAddr = apiRide.drop_location_address || apiRide.drop_address;
    console.log("API RIDE------------>", apiRide);
    return {
        id: apiRide.pickup_id?.toString() ||
            apiRide.engagement_id?.toString() ||
            apiRide.schedule_pickup_id?.toString() ||
            Math.random().toString(),
        engagementId: apiRide.engagement_id?.toString(),
        location: dropAddr?.split(',')[0] || "Unknown",
        subLocation: apiRide.region_name || pickupAddr?.split(',')[0] || "Ride",
        price: Number(apiRide.customer_fare_estimate || apiRide.amount || 0),
        date: apiRide.pickup_time || apiRide.created_at || new Date().toISOString(),
        status: status,
        statusMessage: statusMessage,
        pickupLat: apiRide.latitude || apiRide.pickup_latitude || 0,
        pickupLng: apiRide.longitude || apiRide.pickup_longitude || 0,
        dropLat: apiRide.op_drop_latitude || apiRide.drop_latitude || 0,
        dropLng: apiRide.op_drop_longitude || apiRide.drop_longitude || 0,
        pickupAddress: pickupAddr || "",
        dropAddress: dropAddr || "",
        driver_id: apiRide.driver_id,
        driverName: apiRide.driver_name || "Driver",
        driver_name: apiRide.driver_name,
        driver_number: apiRide.driver_number,
        driver_image: apiRide.driver_image,
        driver_vehicle_name: apiRide.driver_vehicle_name,
        driver_vehicle_brand: apiRide.driver_vehicle_brand,
        driver_vehicle_color: apiRide.driver_vehicle_color,
        driver_vehicle_image: apiRide.driver_vehicle_image,
        vehicle_no: apiRide.vehicle_no,
        distance: (apiRide.estimated_distance || apiRide.distance) ? `${apiRide.estimated_distance || apiRide.distance} ${apiRide.distance_unit || "km"}` : "0 km",
        duration: apiRide.ride_time ? `${apiRide.ride_time} min` : "0 min",
        paymentMethod: apiRide.preferred_payment_mode === 9 ? "Stripe Card" :
            apiRide.preferred_payment_mode === 73 ? "Square Card" :
                "Cash",
        product_type: apiRide.product_type,
        ride_type: apiRide.ride_type,
        historyIcon: apiRide.history_icon,
        pickupId: apiRide.pickup_id || apiRide.schedule_pickup_id, // For scheduled ride cancellation
        poolFareId: apiRide.pool_fare_id, // For modify scheduled ride
        paymentModeId: apiRide.preferred_payment_mode, // For modify scheduled ride
        flightNumber: apiRide.flight_number || "",
        customerNote: apiRide.customer_note || "",
        vehicleName: apiRide.vehicle_name || "",
        vehicleServices: apiRide.vehicle_services || "[]",
        isModifiable: apiRide.modifiable === 1,
        isAddressModifiable: apiRide.address_modifiable === 1,
        schedulerAlarmTime: apiRide.scheduler_alarm_time,
        driver_rating: Number(apiRide.driver_rating) || 0,
        is_rated_before: (apiRide.is_rated_before as 0 | 1) || 0
    };
};

export function useHistory(errorMessage: string, rideType?: string) {
    const { isAuthenticated } = useAuthStore();

    const [rides, setRides] = useState<RideHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("All");
    const [selectedRide, setSelectedRide] = useState<RideHistoryItem | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0); // Page index (0, 1, 2, ...)
    const [historySize, setHistorySize] = useState(0); // Total number of history items
    const [isMobile, setIsMobile] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const ITEMS_PER_PAGE = 12;

    // Filter rides based on active tab
    const filteredRides = useMemo(() => {
        return rides.filter((ride) => {
            if (activeTab === "All") return true;
            return ride.status === activeTab;
        });
    }, [rides, activeTab]);

    // Calculate total pages based on history size
    const totalPages = Math.ceil(historySize / ITEMS_PER_PAGE);

    // Determine if pagination should be shown
    // Hide pagination when limit is set and history size is less than or equal to limit
    const shouldShowPagination = useMemo(() => {
        if (activeTab === 'Scheduled' || activeTab === 'Completed') {
            // These tabs have limit=50, show pagination only if historySize > 50
            return historySize > 50;
        }
        // For other tabs, show pagination if there's more than one page
        return totalPages > 1;
    }, [activeTab, historySize, totalPages]);

    // Detect mobile on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch ride history
    useEffect(() => {
        const controller = new AbortController();

        const loadHistory = async () => {
            if (!isAuthenticated) return;

            try {
                setIsLoading(true);
                const startFrom = currentPage * ITEMS_PER_PAGE;

                // Map ride type to selected_service
                let selected_service: number | undefined;
                if (rideType === 'daily') {
                    selected_service = 1;
                } else if (rideType === 'outstation') {
                    selected_service = 3;
                } else if (rideType === 'airport') {
                    selected_service = 4;
                }

                // Map active tab to ride status filters
                let ride_status_filter: number | undefined;
                let past_ride_status_filter: number | undefined;
                let limit: number | undefined;
                let fetch_cancelled_scheduled_rides: number | undefined;

                if (activeTab === 'Scheduled') {
                    ride_status_filter = 1;
                    fetch_cancelled_scheduled_rides = 0;
                    limit: ITEMS_PER_PAGE;
                } else if (activeTab === 'Completed') {
                    ride_status_filter = 2
                    past_ride_status_filter = 1;
                    limit: ITEMS_PER_PAGE;
                    fetch_cancelled_scheduled_rides = 0;
                } else if (activeTab === 'Cancelled') {
                    ride_status_filter = 2;
                    past_ride_status_filter = 2;
                    limit: ITEMS_PER_PAGE;
                }
                // For 'All' tab, don't add any status filters

                const response = await fetchRideHistory({
                    start_from: startFrom,
                    show_custom_fields: 1,
                    login_type: "0",
                    locale: "en",
                    ...(selected_service !== undefined && { selected_service }),
                    ...(ride_status_filter !== undefined && { ride_status_filter }),
                    ...(past_ride_status_filter !== undefined && { past_ride_status_filter }),
                    ...(limit !== undefined && { limit }),
                    ...(fetch_cancelled_scheduled_rides !== undefined && { fetch_cancelled_scheduled_rides })
                }, controller.signal);

                if (response.data && Array.isArray(response.data)) {
                    const mappedRides = response.data.map(mapApiRideToRideHistoryItem);
                    console.log("mappedRides ---->>>>>>>", response.data);
                    // On mobile, append to existing rides; on desktop, replace
                    if (isMobile && currentPage > 0) {
                        setRides(prev => [...prev, ...mappedRides]);
                    } else {
                        setRides(mappedRides);
                    }
                }

                // Update history size if available
                if (response.history_size !== undefined) {
                    setHistorySize(response.history_size);
                    // Calculate if there are more items to load based on history_size
                    const totalLoaded = (currentPage + 1) * ITEMS_PER_PAGE;
                    setHasMore(totalLoaded < response.history_size);
                } else {
                    // Fallback: check if we got a full page (if API doesn't return history_size)
                    if (response.data && Array.isArray(response.data)) {
                        setHasMore(response.data.length === ITEMS_PER_PAGE);
                    }
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled");
                } else {
                    console.error("History fetch error:", error);
                    toast.error(errorMessage);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                    setIsLoadingMore(false);
                }
            }
        };

        loadHistory();

        return () => {
            controller.abort();
        };
    }, [isAuthenticated, errorMessage, currentPage, rideType, activeTab]);

    // Handle card click
    const handleCardClick = (ride: RideHistoryItem) => {
        if (ride.status === "Completed" || ride.status === "Scheduled") {
            // Ensure all driver fields are present in selectedRide
            setSelectedRide({
                ...ride,
                driver_id: ride.driver_id,
                driverName: ride.driverName || ride.driver_name || "Driver",
                driver_name: ride.driver_name,
                driver_number: ride.driver_number,
                driver_image: ride.driver_image,
                driver_vehicle_name: ride.driver_vehicle_name,
                driver_vehicle_brand: ride.driver_vehicle_brand,
                driver_vehicle_color: ride.driver_vehicle_color,
                driver_vehicle_image: ride.driver_vehicle_image,
                vehicle_no: ride.vehicle_no,
                driver_rating: ride.driver_rating,
            });
            setDetailsOpen(true);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load more for infinite scroll
    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore && isMobile) {
            setIsLoadingMore(true);
            setCurrentPage(prev => prev + 1);
        }
    }, [isLoadingMore, hasMore, isMobile]);

    // Reset when tab or ride type changes
    useEffect(() => {
        setRides([]);
        setCurrentPage(0);
        setHasMore(true);
        setIsLoading(true);
    }, [activeTab, rideType]);

    return {
        rides,
        isLoading,
        activeTab,
        setActiveTab,
        selectedRide,
        detailsOpen,
        setDetailsOpen,
        filteredRides,
        handleCardClick,
        TABS,
        currentPage,
        totalPages,
        handlePageChange,
        isMobile,
        hasMore,
        isLoadingMore,
        loadMore,
        shouldShowPagination
    };
}
