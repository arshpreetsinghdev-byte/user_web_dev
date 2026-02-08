import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AdditionalService {
  id: number | string;
  name: string;
  price?: number;
}

interface PriceOverviewCardProps {
  regionName: string;
  baseFare: number;
  currencySymbol: string;
  additionalServices: AdditionalService[];
  subtotal: number;
  total: number;
  onProceed: () => void;
  buttonLabel?: string;
  className?: string;
}

function formatCurrency(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`;
}

export function PriceOverviewCard({
  regionName,
  baseFare,
  currencySymbol,
  additionalServices,
  subtotal,
  total,
  onProceed,
  buttonLabel = "Proceed to Pay",
  className = "",
}: PriceOverviewCardProps) {
  return (
    <Card
      className={`
        w-full max-w-xl
        rounded-xl
        border border-[#EEEEEE]
        bg-white
        ${className}
      `}
    >
      <div className="flex flex-col gap-3 px-6">
        {/* Title */}
        <h2 className="H2">
          Price Overview
        </h2>

        {/* Booking */}
        <div className="space-y-1">
          <p className="text-base font-semibold text-black">
            Booking
          </p>
          <div className="flex justify-between text-base text-gray-600">
            <span>{regionName}</span>
            <span className="font-medium">
              {formatCurrency(baseFare, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EEEEEE]" />

        {/* Additional Services */}
        <div className="space-y-2">
          <p className="text-base font-semibold text-black">
            Additional services
          </p>

          {additionalServices.length === 0 ? (
            <p className="text-base text-gray-500">
              No additional services.
            </p>
          ) : (
            <div className="space-y-1 text-base text-gray-600">
              {additionalServices.map((svc, idx) => (
                <div
                  key={`${svc.id}-${idx}`}
                  className="flex justify-between"
                >
                  <span>
                    {idx + 1}. {svc.name}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(svc.price || 0, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subtotal & Total box */}
        <div className="rounded-xl border border-[#E5E5E5] p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(subtotal, currencySymbol)}
            </span>
          </div>

          <div className="h-px bg-[#EEEEEE]" />

          <div className="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>
              {formatCurrency(total, currencySymbol)}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onProceed}
          className="
            w-full h-11
            rounded-xl
            bg-primary
            text-white
            font-semibold
            text-base
            shadow-md
            hover:bg-white
            hover:text-primary
            hover:border
            hover:border-border
            transition
            max-sm:hidden
          "
        >
          {buttonLabel}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
