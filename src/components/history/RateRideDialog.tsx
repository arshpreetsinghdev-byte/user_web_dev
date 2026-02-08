"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { RideHistoryItem } from "./HistoryCard";
import { Star, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { rateDriver } from "@/lib/api/history.api";
import { toast } from "sonner";

interface RateRideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ride: RideHistoryItem | null;
    onRatingSubmitted?: () => void;
}

export function RateRideDialog({ open, onOpenChange, ride, onRatingSubmitted }: RateRideDialogProps) {
    const { t } = useTranslations();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error(t("Please select a rating"));
            return;
        }

        if (!ride?.engagementId) {
            toast.error(t("Cannot submit rating: Missing engagement ID"));
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await rateDriver({
                given_rating: rating,
                engagement_id: ride.engagementId,
                feedback: feedback.trim(),
                is_fixed_route: 0 // Hardcoded as per API spec
            });

            if (response.flag === 0 || response.flag === 200 || response.flag === 143) {
                toast.success(t(response.message || "Thank you for your feedback!"));
                onRatingSubmitted?.();
                handleClose();
            } else {
                toast.error(response.message || t("Failed to submit rating"));
            }
        } catch (error) {
            console.error("Failed to submit rating:", error);
            toast.error(t("Failed to submit rating"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setHoverRating(0);
        setFeedback("");
        onOpenChange(false);
    };

    if (!ride) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="p-0 overflow-hidden border-none max-sm:h-full max-sm:max-w-none max-sm:rounded-none sm:max-w-md">
                
                {/* Mobile View */}
                <div className="flex sm:hidden flex-col h-full bg-white">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 border-b bg-white">
                        <DialogTitle className="text-lg font-bold">{t("Rate Your Trip")}</DialogTitle>
                        <button onClick={handleClose} className="p-1">
                            <X className="h-5 w-5 text-gray-500" /> 
                        </button>
                    </div>


                    <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                        {/* Driver Info */}
                        <div className="text-center space-y-2">
                            <div className="w-20 h-20 mx-auto bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">
                                    {ride.driverName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{ride.driverName}</h3>
                            <p className="text-sm text-gray-500">{t("How was your ride?")}</p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`h-12 w-12 ${
                                            star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                {t("Additional Feedback")} ({t("Optional")})
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={t("Share your experience...")}
                                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-400 text-right">{feedback.length}/500</p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="w-full h-12 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("Submitting...")}
                                </span>
                            ) : (
                                t("Submit Rating")
                            )}
                        </Button>
                    </div>
                </div>
                {/* Desktop View */}
                <div className="hidden sm:block bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <DialogTitle className="text-lg font-bold">{t("Rate Your Trip")}</DialogTitle>
                        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            {/* <X className="h-5 w-5 text-gray-500" /> */}
                        </button>
                    </div>

                    <div className="px-6 py-6 space-y-6">
                        {/* Driver Info */}
                        <div className="text-center space-y-2">
                            <div className="w-20 h-20 mx-auto bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">
                                    {ride.driverName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{ride.driverName}</h3>
                            <p className="text-sm text-gray-500">{t("How was your ride?")}</p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={`h-10 w-10 ${
                                            star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Feedback */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                {t("Additional Feedback")} ({t("Optional")})
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={t("Share your experience...")}
                                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-sm"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-400 text-right">{feedback.length}/500</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1 h-11 rounded-xl font-semibold"
                                disabled={isSubmitting}
                            >
                                {t("Cancel")}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className="flex-1 h-11 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t("Submitting...")}
                                    </span>
                                ) : (
                                    t("Submit Rating")
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
