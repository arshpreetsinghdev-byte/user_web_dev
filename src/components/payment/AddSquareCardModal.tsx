"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { addSquareCardWithToken } from "@/lib/api/payment/square-card.api";
import { loadSquareSDK, initializeSquarePayments, createSquareCard, tokenizeSquareCard } from "@/lib/api/payment/square/square";

interface AddSquareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: () => void;
  squareApplicationId: string;
  squareLocationId: string;
}

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/**
 * AddSquareCardModal Component
 * Handles Square card addition flow:
 * 1. Loads Square Web Payments SDK
 * 2. Creates card input element
 * 3. Tokenizes card with Square
 * 4. Sends payment method to backend to save card
 */
export function AddSquareCardModal({
  isOpen,
  onClose,
  onCardAdded,
  squareApplicationId,
  squareLocationId
}: AddSquareCardModalProps) {
  const { sessionId, sessionIdentifier } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [elementsReady, setElementsReady] = useState(false);

  // Refs for Square elements
  const paymentsRef = useRef<any>(null);
  const cardRef = useRef<any>(null);

  /**
   * Load Square Web Payments SDK
   */
  useEffect(() => {
    if (!isOpen) return;

    const loadSDK = async () => {
      // Load Square SDK in sandbox mode since we're using sandbox credentials
      const loaded = await loadSquareSDK('sandbox');
      setSquareLoaded(loaded);
    };

    loadSDK();

    return () => {
      // Cleanup Square elements when modal closes
      if (cardRef.current) {
        try {
          cardRef.current.destroy();
        } catch (e) {
          // console.error('Error destroying Square card:', e);
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      destroySquareElements();
    }
  }, [isOpen]);

  /**
   * Initialize Square after DOM is ready
   */
  useEffect(() => {
    if (!isOpen || !squareLoaded) return;

    const timer = setTimeout(() => {
      initializeSquare();
    }, 200); // Increased timeout to ensure Dialog DOM is fully ready

    return () => clearTimeout(timer);
  }, [isOpen, squareLoaded]);

  /**
   * Initialize Square Payments and create card element
   */
  const initializeSquare = async () => {
    if (!window.Square || !squareApplicationId || !squareLocationId) {
      // toast.error("Square configuration missing");
      return;
    }

    if (cardRef.current) {
      // Already initialized for this open cycle
      return;
    }

    const cardContainer = document.getElementById("square-card-container");

    if (!cardContainer) {
      console.warn("Square DOM not ready yet");
      return;
    }

    try {
      // Initialize Square Payments
      paymentsRef.current = await initializeSquarePayments(squareApplicationId, squareLocationId);

      // Create card element
      cardRef.current = await createSquareCard(paymentsRef.current);

      // Attach card to DOM
      await cardRef.current.attach('#square-card-container');

      setElementsReady(true);
    } catch (err) {
      console.error("Square init failed", err);
      toast.error("Failed to initialize payment form");
      destroySquareElements();
    }
  };

  const destroySquareElements = () => {
    try {
      cardRef.current?.destroy();
    } catch (_) { }

    cardRef.current = null;
    paymentsRef.current = null;

    setElementsReady(false);
  };

  /**
   * Handle card submission
   */
  const handleAddCard = async () => {
    if (!cardRef.current || !sessionId || !sessionIdentifier) {
      toast.error('Payment system not ready');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Processing card...', { id: 'add-square-card' });

      // Step 1: Tokenize card
      console.log('🔐 Step 1: Tokenizing Square card...');
      const token = await tokenizeSquareCard(cardRef.current);

      console.log('✅ Step 1: Token created successfully');

      // Step 2: Prepare card data
      const cardData: any = {
        card_token: token,
      };

      // Step 3: Send card data to backend
      console.log('💾 Step 2: Saving card to backend...');
      const response = await addSquareCardWithToken(
        cardData,
        sessionId,
        sessionIdentifier
      );

      if (response.flag !== 143 && response.flag !== 200) {
        throw new Error(response.message || 'Failed to save card');
      }

      console.log('✅ Step 2: Card saved successfully');
      toast.success('Card added successfully', { id: 'add-square-card' });

      // Notify parent component to refresh card list
      onCardAdded();
      onClose();
    } catch (error: any) {
      console.error('❌ Add Square card failed:', error);
      toast.error(error.message || 'Failed to add card', { id: 'add-square-card' });
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
          {!squareLoaded ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-gray-500">Loading payment form...</p>
            </div>
          ) : (
            <>
              {/* Square Card Container */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Details
                </label>
                <div
                  id="square-card-container"
                  className="min-h-[120px]"
                />
              </div>

              {/* Security Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔒 Your card details are encrypted and securely processed by Square.
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
