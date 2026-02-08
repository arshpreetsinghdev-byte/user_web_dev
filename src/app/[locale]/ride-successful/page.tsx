"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/stores/booking.store";
import { usePayment } from "@/hooks/usePayment";
import {
  SelectedItems,
  TitleBlock,
  PriceBlock,
} from "@/components/SubRegionCard";
import CouponPaymentCard from "@/components/CouponPaymentCard";
import { CardItem } from "@/components/payment/CardItem";
import { SquareCardItem } from "@/components/payment/SquareCardItem";
import { cn } from "@/lib/utils";
import HeaderActions from "@/components/shared/HeaderActions";


/* ---------------------------------- DATA --------------------------------- */

const paymentMethodsData = [
  { id: "cash", label: "Cash", note: "No payment surcharge" },
  { id: "stripe_card", label: "Stripe Card", note: "Secure card payment" },
  { id: "square_card", label: "Square Card", note: "Secure card payment" },
];

/* -------------------------------- HELPERS -------------------------------- */

function formatCurrency(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`;
}

/* ------------------------------ SUCCESS ICON ------------------------------ */

function SuccessBadge() {
  return (
<div className="h-20 w-20 sm:h-24 sm:w-24">
  <svg
    className="h-full w-full"
    viewBox="0 0 103 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M102.346 50C102.346 53.7348 97.2803 56.8508 96.486 60.3451C95.666 63.9535 98.8579 68.9531 97.2876 72.2087C95.6912 75.5179 89.7756 76.1295 87.506 78.9719C85.2252 81.8283 85.9364 87.7286 83.08 90.0094C80.2376 92.279 74.6465 90.2814 71.3373 91.8778C68.0817 93.4482 66.1689 99.0806 62.5605 99.9006C59.0661 100.695 54.9077 96.4686 51.1726 96.4686C47.4374 96.4686 43.2794 100.695 39.7846 99.9006C36.1762 99.0806 34.2634 93.4482 31.0079 91.8778C27.6987 90.2814 22.1075 92.279 19.2651 90.0094C16.4087 87.7286 17.1199 81.8283 14.8395 78.9719C12.5699 76.1295 6.65437 75.5179 5.05798 72.2087C3.48758 68.9531 6.67957 63.9535 5.85957 60.3451C5.06518 56.8508 0 53.7352 0 50C0 46.2652 5.06518 43.1492 5.85957 39.6549C6.67957 36.0465 3.48758 31.0469 5.05798 27.7913C6.65437 24.4821 12.5699 23.8705 14.8395 21.0281C17.1203 18.1717 16.4091 12.2714 19.2655 9.99059C22.1079 7.721 27.6991 9.71859 31.0083 8.1222C34.2638 6.55181 36.1766 0.919431 39.785 0.099435C43.2794 -0.694961 47.4378 3.53142 51.173 3.53142C54.9081 3.53142 59.0661 -0.694961 62.5609 0.099435C66.1693 0.919431 68.0821 6.55181 71.3377 8.1222C74.6469 9.71859 80.238 7.721 83.0804 9.99059C85.9368 12.2714 85.2256 18.1717 87.506 21.0281C89.7756 23.8705 95.6912 24.4821 97.2876 27.7913C98.8579 31.0469 95.666 36.0465 96.486 39.6549C97.2803 43.1492 102.346 46.2652 102.346 50Z"
      fill="url(#paint0_linear_54_669)"
    />
    <path
      d="M76.8859 30.6596C74.5031 28.2768 70.6255 28.2768 68.2427 30.6596L42.6304 56.2719C42.5748 56.3275 42.4848 56.3275 42.4292 56.2719L34.1041 47.9471C31.7213 45.5643 27.8437 45.5643 25.4609 47.9471C23.0781 50.3299 23.0781 54.2075 25.4609 56.5903L38.2081 69.3374C39.3625 70.4918 40.8973 71.1274 42.5296 71.1274C44.162 71.1274 45.6968 70.4918 46.8512 69.3374L76.8855 39.3032C79.2683 36.92 79.2683 33.0424 76.8859 30.6596Z"
      fill="url(#paint1_linear_54_669)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_54_669"
        x1="87.149"
        y1="85.976"
        x2="15.1969"
        y2="14.0239"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#64E987" />
        <stop offset="1" stopColor="#92F294" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_54_669"
        x1="61.8685"
        y1="54.3202"
        x2="40.4781"
        y2="32.9298"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F9F9F8" />
        <stop offset="1" stopColor="white" />
      </linearGradient>
    </defs>
  </svg>
</div>
  );
}

function FailureBadge() {
  return (
    <div className="h-20 w-20 sm:h-24 sm:w-24">
      <svg
        className="h-full w-full"
        viewBox="0 0 103 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M102.346 50C102.346 53.7348 97.2803 56.8508 96.486 60.3451C95.666 63.9535 98.8579 68.9531 97.2876 72.2087C95.6912 75.5179 89.7756 76.1295 87.506 78.9719C85.2252 81.8283 85.9364 87.7286 83.08 90.0094C80.2376 92.279 74.6465 90.2814 71.3373 91.8778C68.0817 93.4482 66.1689 99.0806 62.5605 99.9006C59.0661 100.695 54.9077 96.4686 51.1726 96.4686C47.4374 96.4686 43.2794 100.695 39.7846 99.9006C36.1762 99.0806 34.2634 93.4482 31.0079 91.8778C27.6987 90.2814 22.1075 92.279 19.2651 90.0094C16.4087 87.7286 17.1199 81.8283 14.8395 78.9719C12.5699 76.1295 6.65437 75.5179 5.05798 72.2087C3.48758 68.9531 6.67957 63.9535 5.85957 60.3451C5.06518 56.8508 0 53.7352 0 50C0 46.2652 5.06518 43.1492 5.85957 39.6549C6.67957 36.0465 3.48758 31.0469 5.05798 27.7913C6.65437 24.4821 12.5699 23.8705 14.8395 21.0281C17.1203 18.1717 16.4091 12.2714 19.2655 9.99059C22.1079 7.721 27.6991 9.71859 31.0083 8.1222C34.2638 6.55181 36.1766 0.919431 39.785 0.099435C43.2794 -0.694961 47.4378 3.53142 51.173 3.53142C54.9081 3.53142 59.0661 -0.694961 62.5609 0.099435C66.1693 0.919431 68.0821 6.55181 71.3377 8.1222C74.6469 9.71859 80.238 7.721 83.0804 9.99059C85.9368 12.2714 85.2256 18.1717 87.506 21.0281C89.7756 23.8705 95.6912 24.4821 97.2876 27.7913C98.8579 31.0469 95.666 36.0465 96.486 39.6549C97.2803 43.1492 102.346 46.2652 102.346 50Z"
          fill="url(#errorGradient)"
        />

        <path
          d="M65.5 34.5L36.5 63.5M36.5 34.5L65.5 63.5"
          className="stroke-white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient
            id="errorGradient"
            x1="87.149"
            y1="85.976"
            x2="15.1969"
            y2="14.0239"
          >
            <stop stopColor="#FF5A5A" />
            <stop offset="1" stopColor="#FF8A8A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ------------------------------ MAIN PAGE -------------------------------- */

const SUCCESS_FLAG = 143;

export default function RideSuccessfulPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { 
  selectedRegion, 
  selectedServices, 
  selectedPaymentMethod, 
  selectedCardId, 
  selectedSquareCardId, 
  bookingResult, 
  resetBooking,
  // Add these new fields:
  customerName,
  customerPhone,
  customerCountryCode,
  flightNumber,
  luggageCount,
  driverNote,
} = useBookingStore();
 
  const { paymentDetails } = usePayment();

  const isSuccess = bookingResult?.flag === SUCCESS_FLAG;

  // Debug payment details
  console.log('Ride Successful - selectedPaymentMethod:', selectedPaymentMethod);
  console.log('Ride Successful - selectedCardId:', selectedCardId);
  console.log('Ride Successful - selectedSquareCardId:', selectedSquareCardId);
  console.log('Ride Successful - paymentDetails:', paymentDetails);

  useEffect(() => {
    if (!selectedRegion) {
      router.replace(`/${locale}/home`);
    }
  }, [router, locale, selectedRegion]);

  const region = selectedRegion;
  const currencySymbol = region?.region_fare?.currency_symbol || "€";

  const additionalServices = useMemo(() => {
    if (!selectedServices.length || !region?.vehicle_services) {
      return [];
    }
    return selectedServices
      .map((id) => {
        const svc = region?.vehicle_services?.find((s: { id: number; name: string; price?: number }) => s.id === id);
        return svc ? { id: svc.id, name: svc.name, price: svc.price ?? 0 } : null;
      })
      .filter((svc): svc is { id: number; name: string; price: number } => svc !== null);
  }, [selectedServices, region?.vehicle_services]);

  const baseFare = region?.region_fare?.fare_float ?? 0;
  const extraTotal = additionalServices.reduce((sum, svc) => sum + (svc.price || 0), 0);
  const total = baseFare + extraTotal;

  const payment =
    paymentMethodsData.find((p) => p.id === selectedPaymentMethod) ??
    paymentMethodsData[0];

  const handleBackToHome = () => {
    resetBooking();
    router.push(`/${locale}/home`);
  };

  if (!region) {
    return null;
  }

  return (
    <section className="min-h-screen bg-[#f8f8f8]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <HeaderActions onBack={handleBackToHome} backLabel="Home" />

        {/* Card */}
        <Card className="mt-6 rounded-3xl border-0 shadow-sm p-6 sm:p-8">
          {/* Success/Failure Status */}
          <div className="flex flex-col items-center text-center gap-4 py-6">
            {isSuccess ? <SuccessBadge /> : <FailureBadge />}
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {isSuccess ? "Your ride is all set!" : "Booking Failed"}
            </h1>
            {bookingResult?.message && (
              <p className={`text-sm sm:text-base ${isSuccess ? 'text-gray-600' : 'text-red-600'}`}>
                {bookingResult.message}
              </p>
            )}
            {isSuccess && bookingResult?.fareText && (
              <p className="text-lg font-medium text-primary">
                Estimated Fare: {bookingResult.fareText}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 gap-6">
            {/* LEFT */}

            <SelectedItems
              layout="horizontal"
              imgSrc={region.images.tab_normal}
              additionalServices={additionalServices}
              titleComponent={
                <TitleBlock
                  title={region.region_name}
                  capacity={region.max_people}
                  minutes={region.eta}
                />
              }
              
              priceComponent={
                <PriceBlock
                  currencySymbol={region.region_fare?.currency_symbol || "₹"}
                  price={region.region_fare?.fare_float}
                  oldPrice={undefined}
                />
              }
            />

            <div className="h-0.75 bg-gray-100"></div>
              {/* Booking Details Section */}
              {(customerName || customerPhone || flightNumber || luggageCount > 0 || driverNote) && (
                <>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                    
                    {/* Merged Card with Two Columns */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                        {/* Left Column - Passenger Info & Flight Number */}
                        <div className="space-y-3">
                          {/* Passenger Information */}
                          {(customerName || customerPhone) && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Passenger Information</h4>
                              {customerName && (
                                <div className="flex gap-[10px] items-center">
                                  <span className="text-sm text-gray-600">Name:</span>
                                  <span className="text-sm font-medium text-gray-900">{customerName}</span>
                                </div>
                              )}
                              {customerPhone && (
                                <div className="flex gap-[10px] items-center">
                                  <span className="text-sm text-gray-600">Phone:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {customerCountryCode ? `+${customerCountryCode} ` : ''}{customerPhone}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Flight Number */}
                          {flightNumber && (
                            <div className="space-y-1">
                              <div className="flex gap-[10px] items-center">
                                <span className="text-sm font-medium text-gray-700">Flight Number:</span>
                                <span className="text-sm font-semibold text-blue-900">{flightNumber}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Vertical Divider - only show on desktop when luggage and notes exist */}
                        {luggageCount > 0 && driverNote && (
                          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -ml-px"></div>
                        )}

                        {/* Right Column - Luggage & Driver Note */}
                        <div className="space-y-3">
                          {/* Luggage Count */}
                          {luggageCount > 0 && (
                            <div className="space-y-1">
                              <div className="flex gap-[10px] items-center">
                              <h3 className="text-sm font-medium text-gray-700 mb-1">Luggage:</h3>
                                <span className="text-sm font-medium text-gray-900">{luggageCount} {luggageCount === 1 ? 'bag' : 'bags'}</span>
                              </div>
                            </div>
                          )}

                          {/* Driver Note */}
                          {driverNote && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Note for Driver</h4>
                              <p className="text-sm text-gray-600">{driverNote}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-0.75 bg-gray-100"></div>
                </>
              )}

            {/* Total Amount - existing code continues here */}
            <div className="">
              <div className="flex justify-between items-center py-2">
                <h2 className="text-lg font-semibold">Total Amount</h2>
                <span className="text-xl font-semibold">
                  {formatCurrency(total, currencySymbol)}
                </span>
              </div>

              {/* Show selected payment method */}
              {selectedPaymentMethod === 'cash' && (
                <CouponPaymentCard
                  imgUrl="/cash.png"
                  title="Cash"
                  subtitle="No payment surcharge"
                  onClick={() => {}}
                  disableRadio={true}
                />
              )}

              {selectedPaymentMethod === 'stripe_card' && selectedCardId && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Method</h3>
                  {paymentDetails.stripeCards.length > 0 ? (
                    paymentDetails.stripeCards.map((card) => {
                      const cardId = card.card_id || card.id;
                      if (cardId === selectedCardId) {
                        return (
                          <CardItem
                            key={cardId}
                            card={card}
                            selected={true}
                            onClick={() => {}}
                          />
                        );
                      }
                      return null;
                    })
                  ) : (
                    <p className="text-sm text-gray-600">Stripe Card (****{selectedCardId?.toString().slice(-4) || '****'})</p>
                  )}
                </div>
              )}

              {selectedPaymentMethod === 'square_card' && selectedSquareCardId && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Method</h3>
                  {paymentDetails.squareCards.length > 0 ? (
                    paymentDetails.squareCards.map((card) => {
                      const cardId = card.card_id || card.id;
                      if (cardId === selectedSquareCardId) {
                        return (
                          <SquareCardItem
                            key={cardId}
                            card={card}
                            selected={true}
                            onClick={() => {}}
                          />
                        );
                      }
                      return null;
                    })
                  ) : (
                    <p className="text-sm text-gray-600">Square Card (****{selectedSquareCardId?.toString().slice(-4) || '****'})</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
