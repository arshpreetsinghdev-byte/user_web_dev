"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Stepper from "@/components/Stepper";
import { Card } from "@/components/ui/card";
import { useBookingStore } from "@/stores/booking.store";
import CouponPaymentCard from "@/components/CouponPaymentCard";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { PriceOverviewCard } from "@/components/PriceOverViewCard";
import { toast } from 'sonner';
import { useInsertPickupSchedule } from "@/hooks/useInsertPickupSchedule";
import { usePayment } from "@/hooks/usePayment";
import { CardItem } from "@/components/payment/CardItem";
import { AddCardModal } from "@/components/payment/AddCardModal";
import { SquareCardItem } from "@/components/payment/SquareCardItem";
import { AddSquareCardModal } from "@/components/payment/AddSquareCardModal";
import HeaderActions from "@/components/shared/HeaderActions";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { navigateWithLoader } from "@/lib/utils/navigationLoader";

import {
  TitleBlock,
  PriceBlock,
  SelectedItems,
} from "@/components/SubRegionCard";
import ActionButton from "@/components/shared/ActionButton";

const steps = [
  { label: "Select Car Type" },
  { label: "Choose Service" },
  { label: "Payment" },
];

const paymentMethods = [
  { id: "cash", label: "Cash", note: "No payment surcharge", surcharge: "" }
];

function formatCurrency(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`;
}

export default function RideSummaryPage() {
  // Session guard - validates session every 5 minutes and on mount
  useSessionGuard({
    redirectTo: '/en/home',
    validateInterval: 5 * 60 * 1000 // Validate every 5 minutes
  });

  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const {
    selectedRegion,
    selectedServices,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    selectedCardId,
    setSelectedCardId,
    selectedSquareCardId,
    setSelectedSquareCardId,
    setBookingResult,
  } = useBookingStore();
  const { submitPickupSchedule, isSubmitting } = useInsertPickupSchedule();

  // Fetch payment methods and cards
  const {
    paymentDetails,
    isLoadingPayment,
    selectedCard,
    setSelectedCard,
    selectedSquareCard,
    setSelectedSquareCard,
    isStripeEnabled,
    isSquareEnabled,
    refreshPaymentDetails, // Get refresh function
  } = usePayment();

  // Add card modal states
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddSquareCardModalOpen, setIsAddSquareCardModalOpen] = useState(false);

  // Redirect if no region selected (must be in useEffect, not during render)
  useEffect(() => {
    if (!selectedRegion) {
      router.replace(`/${locale}/book`);
    }
  }, [selectedRegion, router, locale]);

  // Show loading while redirecting
  if (!selectedRegion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const region = selectedRegion;
  const currencySymbol = region.region_fare?.currency || "₹";

  const subProgress = useMemo(() => {
    return selectedPaymentMethod ? 100 : 0;
  }, [selectedPaymentMethod]);

  const additionalServices = useMemo(() => {
    if (!selectedServices.length || !region.vehicle_services) {
      return [];
    }
    return selectedServices
      .map((id) => {
        const svc = region.vehicle_services?.find((s: { id: number; name: string; price?: number }) => s.id === id);
        return svc ? { id: svc.id, name: svc.name, price: svc.price ?? 0 } : null;
      })
      .filter((svc): svc is { id: number; name: string; price: number } => svc !== null);
  }, [selectedServices, region.vehicle_services]);

  const baseFare = region.region_fare?.fare_float ?? 0;
  const additionalTotal = additionalServices.reduce(
    (sum, svc) => sum + (svc.price || 0),
    0
  );
  const subtotal = baseFare + additionalTotal;
  const total = subtotal;

  const handleProceed = useCallback(async () => {
    if (isSubmitting) return;
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method to proceed');
      return;
    }

    // Validate Stripe card selection if Stripe is chosen
    if (selectedPaymentMethod === 'stripe_card' && !selectedCardId) {
      toast.error('Please select a card to proceed');
      return;
    }

    // Validate Square card selection if Square is chosen
    if (selectedPaymentMethod === 'square_card' && !selectedSquareCardId) {
      toast.error('Please select a card to proceed');
      return;
    }

    try {
      toast.loading('Scheduling your ride...', { id: 'schedule-ride' });

      const result = await submitPickupSchedule();

      // Store the booking result for the success page
      setBookingResult({
        flag: result.flag,
        message: result.message || '',
        fareText: result.data?.customer_fare_text,
      });

      if (result.flag === 143 || result.flag === 200) {
        toast.success('Ride scheduled successfully', { id: 'schedule-ride' });
      } else {
        toast.error(result.message || 'Request completed with issues', { id: 'schedule-ride' });
      }

      navigateWithLoader(router, `/${locale}/ride-successful`);
    } catch (err: any) {
      // console.error('❌ Schedule booking failed:', err);
      toast.error(err?.message || 'Failed to schedule ride', { id: 'schedule-ride' });
      setBookingResult({
        flag: err?.flag ?? 0,
        message: err?.message || 'Failed to schedule ride',
        fareText: undefined,
      });
      navigateWithLoader(router, `/${locale}/ride-successful`);
    }
  }, [isSubmitting, locale, router, selectedPaymentMethod, selectedCardId, setBookingResult, submitPickupSchedule]);

  return (
    <section className="relative w-full min-h-[calc(100vh-88px)] pb-20 pt-4 bg-[#f8f8f8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderActions
          onBack={() => router.push(`/${locale}/book`)}
          className="-mt-4 p-1 max-sm:-mx-4"
        />

        <Card className="items-center mb-6 sm:mb-8">
          <Stepper steps={steps} currentStep={2} subProgress={subProgress} />
        </Card>

        <div className="grid w-full grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 xl:gap-8 max-sm:gap-2">
          <div className="flex flex-col gap-6">
            {/* <SelectedItems
              title="Summary"
              className="py-4! px-6!"
              imgSrc={region.images?.tab_normal}
              additionalServices={additionalServices}
              titleComponent={
                <TitleBlock
                  title={region.region_name}
                  capacity={region.max_people}
                  minutes={region.eta || undefined}
                />
              }
              priceComponent={
                <PriceBlock
                  currencySymbol={region.region_fare?.currency_symbol || "₹"}
                  price={region.region_fare?.fare_float}
                  oldPrice={
                    region.region_fare?.original_fare_float !==
                      region.region_fare?.fare_float
                      ? region.region_fare?.original_fare_float
                      : undefined
                  }
                />
              }
            /> */}

            <Card className="px-4 max-sm:border-none max-sm:shadow-none max-sm:px-1 max-sm:mt-0">
              <h1 className="H2">
                Select Payment
              </h1>

              {isLoadingPayment ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-gray-500">Loading payment methods...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Cash Payment Option */}
                  {paymentMethods.map((method) => {
                    const selected = selectedPaymentMethod === method.id;
                    return (
                      <CouponPaymentCard
                        key={method.id}
                        imgUrl="/cash.png"
                        title={method.label}
                        subtitle={method.note}
                        surcharge={method.surcharge}
                        selected={selected}
                        onClick={() => {
                          setSelectedPaymentMethod(method.id);
                          setSelectedCardId(null); // Clear Stripe card selection
                          setSelectedSquareCardId(null); // Clear Square card selection
                        }}
                      />
                    );
                  })}

                  {/* ---------- STRIPE CARDS ---------- */}
                  {isStripeEnabled && (
                    <div className="pt-3">
                      <h3 className="text-sm font-semibold mb-2">Saved Cards (Stripe)</h3>

                      <div className="space-y-2">
                        {paymentDetails.stripeCards.map((card) => {
                          const isSelected =
                            selectedPaymentMethod === "stripe_card" &&
                            selectedCard?.card_id === card.card_id;

                          return (
                            <CardItem
                              key={card.card_id}
                              card={card}
                              selected={isSelected}
                              onClick={() => {
                                setSelectedPaymentMethod("stripe_card");
                                setSelectedCard(card);
                                setSelectedCardId(card.card_id);
                                setSelectedSquareCard(null);
                                setSelectedSquareCardId(null);
                              }}
                              onDelete={() => {
                                refreshPaymentDetails();
                                toast.success("Card deleted");
                              }}
                            />
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setIsAddCardModalOpen(true)}
                        className="w-full mt-3 border-2 border-dashed p-4 rounded-xl text-primary font-semibold"
                      >
                        Add New Stripe Card
                      </button>
                    </div>
                  )}

                  {/* ---------- SQUARE CARDS ---------- */}
                  {isSquareEnabled && (
                    <div className="pt-3">
                      <h3 className="text-sm font-semibold mb-2">Saved Cards (Square)</h3>

                      <div className="space-y-2">
                        {paymentDetails.squareCards.map((card: any) => {
                          const isSelected =
                            selectedPaymentMethod === "square_card" &&
                            selectedSquareCard?.card_id === card.card_id;

                          return (
                            <SquareCardItem
                              key={card.card_id}
                              card={card}
                              selected={isSelected}
                              onClick={() => {
                                setSelectedPaymentMethod("square_card");
                                setSelectedSquareCard(card);
                                setSelectedSquareCardId(card.card_id);
                                setSelectedCard(null);
                                setSelectedCardId(null);
                              }}
                              onDelete={() => {
                                refreshPaymentDetails();
                                toast.success("Card deleted");
                              }}
                            />
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setIsAddSquareCardModalOpen(true)}
                        className="w-full mt-3 border-2 border-dashed p-4 rounded-xl text-primary font-semibold"
                      >
                        Add New Square Card
                      </button>
                    </div>
                  )}

                  {/* Show message if both Stripe and Square are disabled */}
                  {!isStripeEnabled && !isSquareEnabled && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Card payments are not available in your area
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="flex lg:justify-end sm:justify-center">
            <PriceOverviewCard
              className="h-fit sm:min-w-full"
              regionName={region.region_name}
              baseFare={baseFare}
              currencySymbol={currencySymbol}
              additionalServices={additionalServices}
              subtotal={subtotal}
              total={total}
              onProceed={handleProceed}
            />
          </div>

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 w-full py-3 px-4 block sm:hidden bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        <ActionButton onClick={handleProceed} className="w-[90%] px-2 text-lg justify-center mx-auto flex h-12!">
          Proceed to Pay
          <ArrowRight className="h-5 w-5 ml-2" />
        </ActionButton>
      </div>

      {/* Add Stripe Card Modal */}
      {paymentDetails.stripePublishableKey && (
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onCardAdded={() => {
            refreshPaymentDetails(); // Refresh the card list
            toast.success('Card added successfully! You can now select it for payment.');
          }}
          stripePublishableKey={paymentDetails.stripePublishableKey}
        />
      )}

      {/* Add Square Card Modal */}
      {paymentDetails.squareApplicationId && paymentDetails.squareLocationId && (
        <AddSquareCardModal
          isOpen={isAddSquareCardModalOpen}
          onClose={() => setIsAddSquareCardModalOpen(false)}
          onCardAdded={() => {
            refreshPaymentDetails(); // Refresh the card list
            toast.success('Square card added successfully! You can now select it for payment.');
          }}
          squareApplicationId={paymentDetails.squareApplicationId}
          squareLocationId={paymentDetails.squareLocationId}
        />
      )}
    </section>
  );
}
