import Image from "next/image";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";

export type RideStatus = "Completed" | "Cancelled" | "Scheduled" | "Missed Schedule";

export interface RideHistoryItem {
    id: number | string;
    engagementId?: string;
    location: string;
    subLocation: string;
    price: number;
    date: string; // ISO string
    status: RideStatus;
    statusMessage: any,
    // Extended details for Trip Dialog
    pickupLat: number;
    pickupLng: number;
    dropLat: number;
    dropLng: number;
    pickupAddress: string;
    dropAddress: string;
    driverName: string;
    distance: string;
    duration: string;
    paymentMethod: string;
    product_type?: number;
    ride_type?: number;
    historyIcon?: string;
    pickupId?: number | string; // For scheduled rides cancellation
    poolFareId?: number; // For modify scheduled ride
    paymentModeId?: number; // For modify scheduled ride
    // Scheduled ride specific fields
    flightNumber?: string;
    customerNote?: string;
    vehicleName?: string;
    vehicleServices?: string;
    isModifiable?: boolean;
    isAddressModifiable?: boolean;
    schedulerAlarmTime?: number;
    // Rating fields for completed rides
    driver_rating?: number;
    is_rated_before?: 0 | 1;
}

interface HistoryCardProps {
    ride: RideHistoryItem;
    onClick?: (ride: RideHistoryItem) => void;
    onCancel?: (ride: RideHistoryItem) => void;
}

export function HistoryCard({ ride, onClick, onCancel }: HistoryCardProps) {
    const getStatusColor = (status: RideStatus) => {
        switch (status) {
            case "Completed":
                return "bg-[#ECFDF3] text-[#027A48]"; // Success Green
            case "Cancelled":
                return "bg-[#FEF3F2] text-[#B42318]"; // Error Red
            case "Scheduled":
                return "bg-[#FFFAEB] text-[#B54708]"; // Warning Yellow/Orange
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const isCompleted = ride.status === "Completed";
    const isScheduled = ride.status === "Scheduled";
    const isClickable = isCompleted || isScheduled;

    const handleCancelClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click event
        onCancel?.(ride);
    };

    const operatorCurrency = useOperatorParamsStore(
        state => state.data?.user_web_config?.currency || state.data?.user_web_config?.currency_symbol || '₹'
    );

    return (
        <div
            onClick={() => isClickable && onClick?.(ride)}
            className={`bg-white rounded-xl shadow-[0px_1px_3px_rgba(16,24,40,0.1),0px_1px_2px_rgba(16,24,40,0.06)] border border-gray-100 p-4 flex items-center gap-4 ${isClickable ? "hover:shadow-md transition-shadow cursor-pointer" : ""
                }`}
        >
            {/* Car Image */}
            <div className="shrink-0 bg-gray-50 rounded-lg p-2 w-20 h-20 flex items-center justify-center relative overflow-hidden">
                <Image
                    src={ride.historyIcon || "/images/vehicles/mainCar.png"}
                    alt="Vehicle"
                    fill
                    className="object-contain"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 wrap-break-word text-sm sm:text-base leading-tight">
                            {ride.location}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium wrap-break-word">
                            ({ride.subLocation})
                        </p>
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap text-sm sm:text-base shrink-0">
                        {operatorCurrency}{ride.price.toFixed(2)}
                    </span>
                </div>

                <div className="mt-3 flex justify-between items-end">
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                        {ride.date && !isNaN(new Date(ride.date).getTime())
                            ? format(new Date(ride.date), "MMM dd (h:mm a)")
                            : "Date unavailable"}
                    </p>

                    <div className="flex items-center gap-2">
                        {isScheduled && onCancel && (
                            <button
                                onClick={handleCancelClick}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
                                title="Cancel scheduled ride"
                            >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 group-hover:text-red-700" />
                            </button>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(ride.status)}`}>
                            {ride.statusMessage ?? ride.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
