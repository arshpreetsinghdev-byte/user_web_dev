import { Star } from "lucide-react";

interface RatedDriverCardProps {
    rating: number;
    size?: "sm" | "lg";
}

export function RatedDriverCard({ rating, size = "lg" }: RatedDriverCardProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    const sizeClasses = size === "sm" ? "p-4 rounded-xl" : "p-5 rounded-2xl";

    return (
        <div className={`bg-white ${sizeClasses} shadow-sm border border-gray-100 flex items-center justify-between`}>
            <div className="space-y-0.5">
                <h3 className={`font-bold text-gray-900 ${size === "sm" ? "text-sm" : "text-base"}`}>You rated this trip</h3>
                <p className={`${size === "sm" ? "text-xs" : "text-sm"} text-gray-500`}>Thanks for sharing your feedback!</p>
            </div>
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} ${
                            i < fullStars
                                ? "fill-yellow-400 text-yellow-400"
                                : i === fullStars && hasHalfStar
                                ? "fill-yellow-400 text-yellow-400 opacity-50"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
