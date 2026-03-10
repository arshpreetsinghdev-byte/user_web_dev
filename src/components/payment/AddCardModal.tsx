"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { addCardWithToken } from "@/lib/api/payment/card.api";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: () => void;
  stripePublishableKey: string;
}

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * AddCardModal Component
 * Handles Stripe 3D Secure card addition flow:
 * 1. Loads Stripe.js library
 * 2. Creates card input elements
 * 3. Gets setup intent from backend
 * 4. Confirms card setup with Stripe (handles 3D Secure)
 * 5. Sends payment method to backend to save card
 */
export function AddCardModal({
  isOpen,
  onClose,
  onCardAdded,
  stripePublishableKey
}: AddCardModalProps) {
  const { userSessionId, userSessionIdentifier } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [elementsReady, setElementsReady] = useState(false);

  // Refs for Stripe elements
  const stripeRef = useRef<any>(null);
  const cardNumberRef = useRef<any>(null);
  const cardExpiryRef = useRef<any>(null);
  const cardCvcRef = useRef<any>(null);

  /**
   * Load Stripe.js library dynamically
   */
  useEffect(() => {
    if (!isOpen) return;

    // Check if Stripe is already loaded
    if (window.Stripe) {
      setStripeLoaded(true);
      return;
    }

    // Load Stripe.js script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      setStripeLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup Stripe elements when modal closes
      if (cardNumberRef.current) {
        try {
          cardNumberRef.current.unmount();
        } catch (e) { }
      }
      if (cardExpiryRef.current) {
        try {
          cardExpiryRef.current.unmount();
        } catch (e) { }
      }
      if (cardCvcRef.current) {
        try {
          cardCvcRef.current.unmount();
        } catch (e) { }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      destroyStripeElements();
    }
  }, [isOpen]);

  /**
   * Initialize Stripe elements after DOM is ready
   */
  useEffect(() => {
    if (!isOpen || !stripeLoaded) return;

    const timer = setTimeout(() => {
      initializeStripe();
    }, 200); // Increased timeout to ensure Dialog DOM is fully ready

    return () => clearTimeout(timer);
  }, [isOpen, stripeLoaded]);

  /**
   * Initialize Stripe and create card input elements
   */
  const initializeStripe = () => {
    if (!window.Stripe || !stripePublishableKey) {
      // toast.error("Stripe configuration missing");
      return;
    }

    // Check if elements are already mounted
    if (cardNumberRef.current) {
      console.log('Stripe elements already initialized');
      return;
    }

    const cardNumberEl = document.getElementById("card-number-element");
    const cardExpiryEl = document.getElementById("card-expiry-element");
    const cardCvcEl = document.getElementById("card-cvc-element");

    if (!cardNumberEl || !cardExpiryEl || !cardCvcEl) {
      console.warn("Stripe DOM not ready yet");
      return;
    }

    try {
      // Initialize Stripe instance
      if (!stripeRef.current) {
        stripeRef.current = window.Stripe(stripePublishableKey);
      }

      const elements = stripeRef.current.elements();

      const style = {
        base: {
          color: "#31325F",
          fontSize: "16px",
          fontFamily: "Helvetica Neue, Helvetica, sans-serif",
          "::placeholder": { color: "#aab7c4" },
        },
        invalid: { color: "#ef4444" },
      };

      cardNumberRef.current = elements.create("cardNumber", {
        style,
        showIcon: true,
      });
      cardExpiryRef.current = elements.create("cardExpiry", { style });
      cardCvcRef.current = elements.create("cardCvc", { style });

      cardNumberRef.current.mount(cardNumberEl);
      cardExpiryRef.current.mount(cardExpiryEl);
      cardCvcRef.current.mount(cardCvcEl);

      console.log('✅ Stripe elements initialized successfully');
      setElementsReady(true);
    } catch (err) {
      console.error("Stripe init failed", err);
      toast.error("Failed to initialize payment form");
      destroyStripeElements();
    }
  };

  const destroyStripeElements = () => {
    try {
      cardNumberRef.current?.unmount();
      cardExpiryRef.current?.unmount();
      cardCvcRef.current?.unmount();
    } catch (_) { }

    cardNumberRef.current = null;
    cardExpiryRef.current = null;
    cardCvcRef.current = null;
    stripeRef.current = null;

    setElementsReady(false);
  };
  /**
   * Handle card submission with token-based flow (non-3D Secure)
   */
  const handleAddCard = async () => {
    if (!stripeRef.current || !userSessionId || !userSessionIdentifier) {
      toast.error('Payment system not ready');
      return;
    }

    if (!cardNumberRef.current) {
      toast.error('Card information not ready');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Processing card...', { id: 'add-card' });

      // Step 1: Create token from card element
      console.log('🔐 Step 1: Creating Stripe token...');
      const { token, error } = await stripeRef.current.createToken(cardNumberRef.current);

      if (error) {
        throw new Error(error.message || 'Card validation failed');
      }

      if (!token || !token.card) {
        throw new Error('Invalid card token response');
      }

      console.log('✅ Step 1: Token created successfully');

      // Step 2: Prepare card data
      const tokenData = {
        stripe_token: token.id,
        card_id: token.card.id,
        last_4: token.card.last4,
        exp_month: token.card.exp_month,
        exp_year: token.card.exp_year,
        brand: token.card.brand
      };

      // Step 3: Send card data to backend
      console.log('💾 Step 2: Saving card to backend...');
      const response = await addCardWithToken(
        tokenData,
        userSessionId,
        userSessionIdentifier
      );

      if (response.flag !== 143) {
        throw new Error(response.message || 'Failed to save card');
      }

      console.log('✅ Step 2: Card saved successfully');
      toast.success('Card added successfully', { id: 'add-card' });

      // Notify parent component to refresh card list
      onCardAdded();
      onClose();
    } catch (error: any) {
      // console.error('❌ Add card failed:', error);
      toast.error(error.message || 'Failed to add card', { id: 'add-card' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-full p-0 gap-0 border-none overflow-hidden bg-white rounded-2xl z-[200]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-800">Add New Card</DialogTitle>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {!stripeLoaded ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-gray-500">Loading payment form...</p>
            </div>
          ) : (
            <>
              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number
                </label>
                <div
                  id="card-number-element"
                  className="p-3 border-2 border-gray-200 rounded-lg focus-within:border-primary transition-colors h-11"
                />
              </div>

              {/* Expiry and CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <div
                    id="card-expiry-element"
                    className="p-3 border-2 border-gray-200 rounded-lg focus-within:border-primary transition-colors h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CVC
                  </label>
                  <div
                    id="card-cvc-element"
                    className="p-3 border-2 border-gray-200 rounded-lg focus-within:border-primary transition-colors h-11"
                  />
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔒 Your card details are encrypted and securely processed by Stripe.
                  We never store your full card information.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddCard}
            disabled={isLoading || !elementsReady}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Add Card'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

