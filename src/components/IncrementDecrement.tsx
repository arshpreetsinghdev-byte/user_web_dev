import { Minus, Plus } from "lucide-react";

type IncrementDecrementProps = {
  title?: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function IncrementDecrement({
  title,
  value,
  onIncrement,
  onDecrement,
}: IncrementDecrementProps) {
  return (
    <div className="flex gap-2 justify-between items-center">
    <h2 className="H3">
        {title}
    </h2>

    <div className="inline-flex items-center overflow-hidden rounded-md border border-primary bg-primary/10">
      <button
        onClick={onDecrement}
        aria-label="Decrement"
        className="flex h-8 w-8 items-center justify-center text-primary hover:bg-primary/10"
      >
        <Minus size={20} />
      </button>

      <span className="px-2 text-lg font-medium select-none max-sm:px-1">
        {value}
      </span>

      <button
        onClick={onIncrement}
        aria-label="Increment"
        className="flex h-8 w-8 items-center justify-center text-primary hover:bg-primary/10"
      >
        <Plus size={20} />
      </button>
    </div>
    </div>
  );
}
