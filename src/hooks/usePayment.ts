"use client";

import { useState, useEffect } from "react";
import { useBookingStore } from "@/stores/booking.store";
import { useAuthStore } from "@/stores/auth.store";
import apiClient from "@/lib/api/client";
import { toast } from "sonner";
import { SquareCardData } from "@/lib/api/payment/square-card.api";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";

/* -------------------- Types -------------------- */

export interface StripeCard {
  id: string;
  card_id: string;
  last_4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  name?: string;
}

export interface PaymentDetails {
  stripeCards: StripeCard[];
  squareCards: SquareCardData[];
  isStripeEnabled: number;
  isSquareEnabled: number;
  walletBalance: number;
  paymentModeLoaded: boolean;
  stripePublishableKey?: string;
  squareApplicationId?: string;
  squareLocationId?: string;
}

/* -------------------- Helpers -------------------- */

const normalizeStripeCards = (cards: any[]): StripeCard[] =>
  cards.map((card) => {
    const id = String(card.card_id ?? card.id);
    return {
      ...card,
      id,
      card_id: id,
    };
  });

const normalizeSquareCards = (cards: any[]): SquareCardData[] =>
  cards.map((card: any) => {
    const id = String(card.card_id ?? card.id);
    return {
      ...card,
      id,
      card_id: id,
    };
  });

/* -------------------- Hook -------------------- */

export function usePayment() {
  const { pickup } = useBookingStore();
  const { sessionId, sessionIdentifier } = useAuthStore();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    stripeCards: [],
    squareCards: [],
    isStripeEnabled: 0,
    isSquareEnabled: 0,
    walletBalance: 0,
    paymentModeLoaded: false,
  });

  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedCard, setSelectedCard] = useState<StripeCard | null>(null);
  const [selectedSquareCard, setSelectedSquareCard] =
    useState<SquareCardData | null>(null);

  /* -------------------- Fetch / Refresh -------------------- */

  const fetchPaymentDetails = async (isRefresh = false) => {
    if (!pickup?.lat || !pickup?.lng || !sessionId || !sessionIdentifier) {
      return;
    }

    try {
      isRefresh ? setIsRefreshing(true) : setIsLoadingPayment(true);

      const response = await apiClient.post("/open/v1/fetch_wallet_balance", {
        latitude: pickup.lat,
        longitude: pickup.lng,
      });

      const data = response.data;

      

      if (data.flag !== 143 && data.flag !== 200) {
        throw new Error(data.message || "Failed to fetch payment details");
      }

      const responseData = data.data;

      const stripeConfig = responseData.payment_mode_config_data?.find(
        (i: any) => i.name === "stripe_cards"
      );

      const squareConfig = responseData.payment_mode_config_data?.find(
        (i: any) => i.name === "square_cards"
      );
      const config = useOperatorParamsStore.getState().getUserWebConfig();

      setPaymentDetails({
        stripeCards: normalizeStripeCards(
          responseData.stripe_cards || stripeConfig?.cards_data || []
        ),
        squareCards: normalizeSquareCards(
          responseData.square_cards || squareConfig?.cards_data || []
        ),
        isStripeEnabled: stripeConfig?.enabled || 0,
        isSquareEnabled: squareConfig?.enabled || 0,
        walletBalance: responseData.jugnoo_balance || 0,
        paymentModeLoaded: true,
        stripePublishableKey:
          config?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
          stripeConfig?.stripe_publishable_key ||
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        squareApplicationId: 
          config?.NEXT_PUBLIC_SQUARE_APPLICATION_ID ||
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        squareLocationId: 
          config?.NEXT_PUBLIC_SQUARE_LOCATION_ID ||
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment methods");
    } finally {
      setIsLoadingPayment(false);
      setIsRefreshing(false);
    }
  };

  /* -------------------- Initial Load -------------------- */

  useEffect(() => {
    fetchPaymentDetails(false);
  }, [pickup, sessionId, sessionIdentifier]);

  /* -------------------- Selection Reconciliation -------------------- */

  useEffect(() => {
    if (
      selectedCard &&
      !paymentDetails.stripeCards.some(
        (c) => c.card_id === selectedCard.card_id
      )
    ) {
      setSelectedCard(null);
    }
  }, [paymentDetails.stripeCards]);

  useEffect(() => {
    if (
      selectedSquareCard &&
      !paymentDetails.squareCards.some(
        (c: any) => c.card_id === selectedSquareCard.card_id
      )
    ) {
      setSelectedSquareCard(null);
    }
  }, [paymentDetails.squareCards]);

  /* -------------------- Public API -------------------- */

  return {
    paymentDetails,
    isLoadingPayment,
    isRefreshing,
    selectedCard,
    setSelectedCard,
    selectedSquareCard,
    setSelectedSquareCard,
    isStripeEnabled: paymentDetails.isStripeEnabled === 1,
    isSquareEnabled: paymentDetails.isSquareEnabled === 1,
    refreshPaymentDetails: () => fetchPaymentDetails(true),
  };
}
