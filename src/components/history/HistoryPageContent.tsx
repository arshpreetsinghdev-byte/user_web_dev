"use client";

import { useEffect } from "react";
import { HistoryCard } from "./HistoryCard";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";


import { TripDetailsDialog } from "./TripDetailsDialog";
import { Pagination } from "./Pagination";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";
import { useHistory } from "../../hooks/useHistory";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { cancelScheduledRide } from "@/lib/api/history.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Select } from "@/components/ui/select";

// Shimmer Skeleton Component for Loading State
const HistoryCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] border border-gray-100 p-4 flex items-center gap-4 animate-pulse">
        {/* Car Image Skeleton */}
        <div className="shrink-0 bg-gray-200 rounded-lg w-20 h-20" />

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 space-y-3">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
            </div>

            <div className="flex justify-between items-end">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
        </div>
    </div>
);

export function HistoryPageContent() {
    // Session guard - validates session if user is authenticated
    const { isAuthenticated } = useAuthStore();
    useSessionGuard({
        redirectTo: '/en/home',
        validateInterval: 5 * 60 * 1000, // Validate every 5 minutes
        skipInitialValidation: !isAuthenticated // Only validate if authenticated
    });

    const { t } = useTranslations();

    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [rideToCancel, setRideToCancel] = useState<any>(null);
    const [rideType, setRideType] = useState<string>('daily');

    const {
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
    } = useHistory(t("Failed to load ride history"), rideType);

    // Infinite scroll handler for mobile
    useEffect(() => {
        if (!isMobile) return;

        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            // Load more when user is 200px from bottom
            if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoadingMore) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobile, hasMore, isLoadingMore, loadMore]);

    // Handle cancel scheduled ride
    // const handleCancelScheduledRide = async (ride: any) => {
    //     if (!ride.pickupId) {
    //         toast.error(t("Cannot cancel: Missing pickup ID"));
    //         return;
    //     }

    //     // Show confirmation dialog
    //     const confirmed = window.confirm(
    //         t("Are you sure you want to cancel this scheduled ride?")
    //     );

    //     if (!confirmed) return;

    //     try {
    //         setIsCancelling(true);
    //         const response = await cancelScheduledRide({
    //             pickup_id: ride.pickupId,
    //             is_driver: 0 // Always 0 for customer
    //         });

    //         if (response.flag === 0 || response.flag === 200 || response.flag === 143) {
    //             toast.success(t("Scheduled ride cancelled successfully"));
    //             // Refresh the ride history
    //             window.location.reload();
    //         } else {
    //             toast.error(response.message || t("Failed to cancel scheduled ride"));
    //         }
    //     } catch (error) {
    //         console.error("Failed to cancel scheduled ride:", error);
    //         toast.error(t("Failed to cancel scheduled ride"));
    //     } finally {
    //         setIsCancelling(false);
    //     }
    // };
    const handleCancelScheduledRide = async (ride: any) => {
        if (!ride.pickupId) {
            toast.error(t("Cannot cancel: Missing pickup ID"));
            return;
        }

        // Show confirmation dialog
        setRideToCancel(ride);
        setCancelDialogOpen(true);
    };

    const confirmCancelRide = async () => {
        if (!rideToCancel) return;

        try {
            setIsCancelling(true);
            setCancelDialogOpen(false);
            const response = await cancelScheduledRide({
                pickup_id: rideToCancel.pickupId,
                is_driver: 0 // Always 0 for customer
            });

            if (response.flag === 0 || response.flag === 200 || response.flag === 143) {
                toast.success(t("Scheduled ride cancelled successfully"));
                // Refresh the ride history
                window.location.reload();
            } else {
                toast.error(response.message || t("Failed to cancel scheduled ride"));
            }
        } catch (error) {
            console.error("Failed to cancel scheduled ride:", error);
            toast.error(t("Failed to cancel scheduled ride"));
        } finally {
            setIsCancelling(false);
            setRideToCancel(null);
        }
    };




    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-gray-50 p-8 rounded-2xl border border-dashed flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{t("Access Protected")}</h2>
                        <p className="text-gray-500">{t("Please login to view your ride history and manage your trips.")}</p>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-login'))}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            {t("Login Now")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6 md:gap-8 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-800">{t("History")}</h1>

                    {/* Tabs/Pills */}
                    <div className="flex bg-transparent gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {t(tab)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dropdown */}
                <div className="w-full md:w-auto">
                    <Select value={rideType} onValueChange={setRideType}>
                        <SelectTrigger className="w-35 bg-gray-100 border-none rounded-2xl font-medium text-gray-700 focus:bg-white transition-colors">
                            <SelectValue placeholder={t("Daily")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">{t("Daily")}</SelectItem>
                            <SelectItem value="airport">{t("Airport")}</SelectItem>
                            <SelectItem value="outstation">{t("Outstation")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <HistoryCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredRides.slice(0, activeTab === 'Completed' ? 12 : filteredRides.length).map((ride) => (
                            <HistoryCard
                                key={ride.id}
                                ride={ride}
                                onClick={handleCardClick}
                                onCancel={handleCancelScheduledRide}
                            />
                        ))}
                    </div>

                    {filteredRides.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed text-gray-400">
                            {t("No rides found")}
                        </div>
                    )}

                    {/* Pagination - Desktop only and only when needed */}
                    {!isMobile && shouldShowPagination && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}

                    {/* Loading indicator for mobile infinite scroll */}
                    {isMobile && isLoadingMore && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <HistoryCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* End of results indicator for mobile */}
                    {isMobile && !hasMore && filteredRides.length > 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {t("No more rides to load")}
                        </div>
                    )}
                </>
            )}

            {/* Trip Details Dialog for Completed Rides */}
            <TripDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                ride={selectedRide}
            />

            {/* Loading overlay for cancelling */}
            {isCancelling && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-gray-700 font-medium">{t("Cancelling scheduled ride...")}</p>
                    </div>
                </div>
            )}
            {/* Cancel Confirmation Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{t("Cancel Scheduled Ride")}</DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <p className="text-gray-600">
                            {t("Are you sure you want to cancel this scheduled ride?")}
                        </p>

                        {rideToCancel && (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                    {rideToCancel.location}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {rideToCancel.date && !isNaN(new Date(rideToCancel.date).getTime())
                                        ? format(new Date(rideToCancel.date), "MMM dd, h:mm a")
                                        : "Date unavailable"}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                            disabled={isCancelling}
                        >
                            {t("No, Keep It")}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmCancelRide}
                            disabled={isCancelling}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isCancelling ? t("Cancelling...") : t("Yes, Cancel Ride")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
