import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ActionButton from "./ActionButton";

type HeaderActionsProps = {
  onBack: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  className?: string;
  backButtonClassName?: string;
  nextButtonClassName?: string;
  hideNextOnMobile?: boolean;
};

const wrapperBase = "flex items-center mb-4 py-2 sm:py-3 max-sm:-mx-2 max-sm:shadow-lg max-sm:bg-white";
const backButtonBase = "w-25! h-10! text-gray-700! max-sm:text-lg hover:bg-white! max-sm:border-none max-sm:shadow-none";
const nextButtonBase = "w-25! h-10!";

export default function HeaderActions({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  className,
  backButtonClassName,
  nextButtonClassName,
  hideNextOnMobile = true,
}: HeaderActionsProps) {
  const wrapperJustify = onNext ? "justify-between" : "justify-start";

  return (
    <div className={cn(wrapperBase, wrapperJustify, className)}>
      <ActionButton
        onClick={onBack}
        variant="outline"
        className={cn(backButtonBase, backButtonClassName)}
      >
        <ArrowLeft className="h-4! w-4! max-sm:h-5! max-sm:w-5!" />
        {backLabel}
      </ActionButton>

      {onNext && (
        <ActionButton
          onClick={onNext}
          className={cn(nextButtonBase, hideNextOnMobile && "max-sm:hidden", nextButtonClassName)}
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4" />
        </ActionButton>
      )}
    </div>
  );
}
