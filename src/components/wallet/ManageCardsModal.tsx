"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, CreditCard, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useWallet, StripeCard } from "@/hooks/useWallet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddCardModal } from "@/components/payment/AddCardModal";
import { AddSquareCardModal } from "@/components/payment/AddSquareCardModal";
import { motion, AnimatePresence } from "framer-motion";
import { deleteStripeCard } from "@/lib/api/payment/card.api";
import { deleteSquareCard } from "@/lib/api/payment/square-card.api";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ManageCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardItemProps {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  onDelete: () => void;
  isDeleting: boolean;
}

interface CardToDelete {
  cardId: string | number;
  brand: string;
  last4: string;
  type: 'stripe' | 'square';
}

function CardItem({ brand, last4, expMonth, expYear, onDelete, isDeleting }: CardItemProps) {
  return (
    <div className="w-full flex items-center justify-between rounded-2xl shadow-sm border border-gray-100 p-4 transition-all hover:border-gray-200">
      <div className="flex items-center gap-4 text-left">
        <div className="h-10 w-10 relative">
          <Image
            src={`/images/cards/${brand.toLowerCase()}.png`}
            alt={brand}
            fill
            className="object-contain p-2 md:p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/cards/default.png';
            }}
          />
        </div>
        <div>
          <p className="text-base font-semibold text-black">
            {brand} •••• {last4}
          </p>
          <p className="text-sm text-gray-500">
            Expires {expMonth}/{expYear}
          </p>
        </div>
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className={cn(
          "p-2 rounded-lg transition-colors",
          isDeleting
            ? "bg-gray-100 cursor-not-allowed"
            : "hover:bg-red-50 text-red-500 hover:text-red-600"
        )}
      >
        {isDeleting ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <Trash2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

export function ManageCardsModal({ isOpen, onClose }: ManageCardsModalProps) {
  const { t } = useTranslations();
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddSquareCardModalOpen, setIsAddSquareCardModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | number | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardToDelete | null>(null);

  const {
    stripeCards,
    squareCards,
    isStripeEnabled,
    isSquareEnabled,
    stripePublishableKey,
    squareApplicationId,
    squareLocationId,
    isLoading,
    refetch
  } = useWallet();

  const wasOpen = React.useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setIsVisible(true);
      refetch();
      setIsAddCardModalOpen(false);
      setIsAddSquareCardModalOpen(false);
      setCardToDelete(null);
    } else if (!isOpen) {
      setIsVisible(false);
    }
    wasOpen.current = isOpen;
  }, [isOpen, refetch]);

  const promptDeleteCard = (card: CardToDelete) => {
    setCardToDelete(card);
  };

  const cancelDelete = () => {
    setCardToDelete(null);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;

    const { cardId, type } = cardToDelete;
    setCardToDelete(null);

    if (type === 'stripe') {
      await handleDeleteStripeCard(cardId);
    } else {
      await handleDeleteSquareCard(cardId);
    }
  };

  const handleDeleteStripeCard = async (cardId: string | number) => {
    try {
      setDeletingCardId(cardId);
      toast.loading(t('Deleting card...'), { id: 'delete-card' });

      const response = await deleteStripeCard(cardId);

      if (response.flag === 143 || response.flag === 200) {
        toast.success(t('Card deleted successfully'), { id: 'delete-card' });
        await refetch();
      } else {
        throw new Error(response.message || t('Failed to delete card'));
      }
    } catch (error: any) {
      toast.error(error.message || t('Failed to delete card'), { id: 'delete-card' });
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleDeleteSquareCard = async (cardId: string | number) => {
    try {
      setDeletingCardId(cardId);
      toast.loading(t('Deleting card...'), { id: 'delete-card' });

      const response = await deleteSquareCard(cardId);

      if (response.flag === 143 || response.flag === 200) {
        toast.success(t('Card deleted successfully'), { id: 'delete-card' });
        await refetch();
      } else {
        throw new Error(response.message || t('Failed to delete card'));
      }
    } catch (error: any) {
      toast.error(error.message || t('Failed to delete card'), { id: 'delete-card' });
    } finally {
      setDeletingCardId(null);
    }
  };

  const noPaymentEnabled = !isStripeEnabled && !isSquareEnabled;

  return (
    <>
      <AnimatePresence mode="wait" onExitComplete={() => !isVisible && onClose()}>
        {isVisible && (
          <Dialog open={true} onOpenChange={() => setIsVisible(false)}>
            <DialogContent
              showCloseButton={false}
              className="max-w-md w-full p-0 gap-0 border-none overflow-hidden bg-primary rounded-2xl z-100"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <DialogTitle className="sr-only">{t('Manage Cards')}</DialogTitle>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t('Manage Cards')}</h2>
                      <p className="text-sm text-white/80 mt-1">
                        {t('Add or remove your payment cards')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] bg-white overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12 gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-gray-500">{t('Loading cards...')}</p>
                    </div>
                  ) : noPaymentEnabled ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t('Card payments are not available in your area')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Stripe Cards Section */}
                      {isStripeEnabled && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            {t('Stripe Cards')}
                          </h3>
                          <div className="space-y-2">
                            {stripeCards?.length > 0 ? (
                              stripeCards.map((card: StripeCard, index: number) => (
                                <CardItem
                                  key={card.card_id || card.id || `stripe-${index}`}
                                  brand={card.brand}
                                  last4={card.last_4}
                                  expMonth={card.exp_month}
                                  expYear={card.exp_year}
                                  onDelete={() => promptDeleteCard({
                                    cardId: card.card_id || card.id,
                                    brand: card.brand,
                                    last4: card.last_4,
                                    type: 'stripe'
                                  })}
                                  isDeleting={deletingCardId === (card.card_id || card.id)}
                                />
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">
                                {t('No saved Stripe cards')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setIsAddCardModalOpen(true)}
                            className="w-full mt-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary"
                          >
                            <Plus className="h-5 w-5" />
                            <span className="font-medium">{t('Add New Stripe Card')}</span>
                          </button>
                        </div>
                      )}

                      {/* Square Cards Section */}
                      {isSquareEnabled && (
                        <div className={isStripeEnabled ? "pt-3 border-t" : ""}>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            {t('Square Cards')}
                          </h3>
                          <div className="space-y-2">
                            {squareCards?.length > 0 ? (
                              squareCards.map((card: any, index: number) => (
                                <CardItem
                                  key={card.card_id || card.id || `square-${index}`}
                                  brand={card.card_brand || card.brand || 'Card'}
                                  last4={card.last_4}
                                  expMonth={card.exp_month}
                                  expYear={card.exp_year}
                                  onDelete={() => promptDeleteCard({
                                    cardId: card.card_id || card.id,
                                    brand: card.card_brand || card.brand || 'Card',
                                    last4: card.last_4,
                                    type: 'square'
                                  })}
                                  isDeleting={deletingCardId === (card.card_id || card.id)}
                                />
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-2">
                                {t('No saved Square cards')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setIsAddSquareCardModalOpen(true)}
                            className="w-full mt-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary"
                          >
                            <Plus className="h-5 w-5" />
                            <span className="font-medium">{t('Add New Square Card')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
                  <Button
                    variant="outline"
                    onClick={() => setIsVisible(false)}
                    className="w-full"
                  >
                    {t('Close')}
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Add Stripe Card Modal */}
      {stripePublishableKey && (
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onCardAdded={() => {
            refetch();
            toast.success(t('Card added successfully!'));
            setIsAddCardModalOpen(false);
          }}
          stripePublishableKey={stripePublishableKey}
        />
      )}

      {/* Add Square Card Modal */}
      {squareApplicationId && squareLocationId && (
        <AddSquareCardModal
          isOpen={isAddSquareCardModalOpen}
          onClose={() => setIsAddSquareCardModalOpen(false)}
          onCardAdded={() => {
            refetch();
            toast.success(t('Card added successfully!'));
            setIsAddSquareCardModalOpen(false);
          }}
          squareApplicationId={squareApplicationId}
          squareLocationId={squareLocationId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {cardToDelete && (
        <div className="fixed inset-0 z-[400]">
          <Dialog open={true} onOpenChange={(open) => !open && cancelDelete()}>
            <DialogContent className="w-[400px] p-0 gap-0 border-none overflow-hidden rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-black/5 bg-white transform perspective-1000 z-[500]">
              <DialogTitle className="sr-only">{t('Delete Card')}</DialogTitle>
              <div className="p-4 text-center">
                <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {t('Delete Card?')}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  {t('Are you sure you want to delete this card?')}
                </p>
                <p className="text-xs font-medium text-gray-700">
                  {cardToDelete.brand} •••• {cardToDelete.last4}
                </p>
              </div>
              <div className="flex gap-2 p-3 border-t bg-gray-50">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1 h-8 text-sm"
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1 h-8 text-sm"
                >
                  {t('Delete')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
