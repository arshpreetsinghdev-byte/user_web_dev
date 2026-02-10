'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutosCoupon } from '@/types';

interface AutosCouponCardProps {
  coupon: AutosCoupon;
  selected?: boolean;
  onClick?: () => void;
  variant?: "outline" | "filled";
  bordered?: boolean;
}

export default function AutosCouponCard({
  coupon,
  selected = false,
  onClick,
  variant = "filled",
  bordered = true,
}: AutosCouponCardProps) {
    let imgLink = "/bxs_offer.png"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full relative overflow-hidden rounded-lg p-4 transition-all duration-200',
        bordered
          ? (variant === "outline"
              ? 'border border-gray-200 bg-white hover:border-gray-300'
              : 'border border-white/30 bg-white/10 hover:bg-white/15')
          : (variant === "outline" ? 'bg-white' : 'bg-white/10'),
        selected && (
          variant === "outline"
            ? 'border-primary bg-primary/5 ring-1 ring-primary'
            : 'border-white/50 bg-white/20 ring-1 ring-white/50'
        )
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Discount Info with icon */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 relative shrink-0">
              <Image src={imgLink} alt="offer" fill className="object-contain" />
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-2l lg:text-2l font-bold",
                  variant === "outline" ? "text-primary" : "text-white"
                )}>
                  Get {coupon.discount_percentage}%
                </span>
                <span className={cn(
                  "text-xs lg:text-sm font-medium",
                  variant === "outline" ? "text-gray-600" : "text-white/70"
                )}>
                  off
                </span>
              </div>

              <p className={cn(
                "text-xs lg:text-sm font-medium mt-1",
                variant === "outline" ? "text-gray-600" : "text-white/70"
              )}>
                Upto ${coupon.discount_maximum} discount
              </p>
            </div>
          </div>
        </div>

        {/* Right: Check Icon */}
        {selected && (
          <div className={cn(
            "shrink-0 rounded-full p-1",
            variant === "outline" ? "bg-primary text-white" : "bg-white/30 text-white"
          )}>
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
    </button>
  );
}
