import { useState } from "react";
import { CreditCard, Trash2 } from "lucide-react";
import { StripeCard } from "@/hooks/usePayment";
import { toast } from "sonner";
import { deleteStripeCard } from "@/lib/api/payment/card.api";

interface CardItemProps {
  card: StripeCard;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

/**
 * CardItem Component
 * Displays a saved Stripe card with brand, last 4 digits, and expiry
 */
export function CardItem({ card, selected, onClick, onDelete }: CardItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

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
      toast.loading('Deleting card...', { id: 'delete-stripe-card' });

      const response = await deleteStripeCard(cardId);

      if (response.flag === 144 || response.flag === 200) {
        toast.success('Card deleted successfully', { id: 'delete-stripe-card' });
        onDelete?.();
      } else {
        throw new Error(response.message || 'Failed to delete card');
      }
    } catch (error: any) {
      // console.error('❌ Delete stripe card failed:', error);
      toast.error(error.message || 'Failed to delete card', { id: 'delete-stripe-card' });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      onClick={isDeleting ? undefined : onClick}
      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 cursor-pointer ${selected
        ? "border-primary bg-primary/5 shadow-sm"
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* Card Icon */}
      <div className={`p-3 rounded-lg ${selected ? "bg-primary/10" : "bg-gray-100"}`}>
        <CreditCard className={`h-6 w-6 ${selected ? "text-primary" : "text-gray-600"}`} />
      </div>

      {/* Card Details */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 capitalize">{card.brand}</span>
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
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-gray-300"
          }`}
      >
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </div>
  );
}
