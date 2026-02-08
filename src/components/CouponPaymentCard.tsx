'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CouponPaymentCardProps {
  imgUrl: string;
  title: string;
  subtitle?: string;
  surcharge?: string;
  selected?: boolean;
  onClick?: () => void;
  disableRadio?: boolean;
}

export default function CouponPaymentCard({
  imgUrl,
  title,
  subtitle,
  surcharge,
  selected = false,
  onClick,
  disableRadio = false,
}: CouponPaymentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between rounded-2xl shadow-sm border p-5 transition-all',
        selected
          ? 'border-primary ring-primary'
          : 'border-gray-100 hover:border-gray-200'
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-4 text-left">
        <div className="h-10 w-10 relative">
          <Image
            src={imgUrl}
            alt={title}
            fill
            className="object-contain p-2 md:p-1"
          />
        </div>

        <div>
          <p className="text-base font-semibold text-black">{title}</p>

          <div className="flex items-center gap-2">
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}

            {surcharge && (
              <p className="text-sm text-primary font-medium">
                {surcharge}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Radio */}
      {!disableRadio && (
        <div
          className={cn(
            'h-5 w-5 rounded-full border flex items-center justify-center',
            selected
              ? 'border-primary'
              : 'border-gray-400'
          )}
        >
          {selected && (
            <div className="h-3 w-3 rounded-full bg-primary" />
          )}
        </div>
      )}
    </button>
  );
}