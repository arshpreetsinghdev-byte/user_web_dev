import React, { useState } from "react";
import { CreditCard, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SquareCardData } from "@/lib/api/payment/square-card.api";
import { deleteSquareCard } from "@/lib/api/payment/square-card.api";

interface SquareCardItemProps {
  card: SquareCardData;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void; // Callback after successful deletion
}

/**
 * SquareCardItem Component
 * Displays a saved Square card with brand, last 4 digits, and expiry
 */
export function SquareCardItem({ card, selected, onClick, onDelete }: SquareCardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking delete

    const cardId = card.card_id || card.id;
    if (!cardId) {
      toast.error('Invalid card ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      setIsDeleting(true);
      toast.loading('Deleting card...', { id: 'delete-square-card' });

      const response = await deleteSquareCard(cardId);

      if (response.flag === 143 || response.flag === 200) {
        toast.success('Card deleted successfully', { id: 'delete-square-card' });
        onDelete?.(); // Trigger refresh
      } else {
        throw new Error(response.message || 'Failed to delete card');
      }
    } catch (error: any) {
      // console.error('❌ Delete square card failed:', error);
      toast.error(error.message || 'Failed to delete card', { id: 'delete-square-card' });
    } finally {
      setIsDeleting(false);
    }
  };
  console.log(
    "CARD:",
    card.card_id,
    "SELECTED:",
    selected
  );
  return (
    <>
      <div
        onClick={isDeleting ? undefined : onClick}
        role="button"
        tabIndex={0}
        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 cursor-pointer
        ${selected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}
        ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}
      `}
      >
        {/* Card Icon */}
        <div className={`p-3 rounded-lg ${selected ? "bg-primary/10" : "bg-gray-100"}`}>
          <CreditCard className={`h-6 w-6 ${selected ? "text-primary" : "text-gray-600"}`} />
        </div>

        {/* Card Details */}
        <div className="flex-1 text-left" onClick={() => {
          console.log("CARD CLICKED");
          onClick();
        }}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 capitalize">
              {card.card_brand || "Card"}
            </span>
            <span className="text-gray-500">****{card.last_4}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Expires {card.exp_month}/{card.exp_year}
          </p>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
            title="Delete card"
          >
            <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
          </button>
        )}

        {/* Selection Indicator */}
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${selected ? "border-primary bg-primary" : "border-gray-300"}
        `}
        >
          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>

    </>
  );
}
