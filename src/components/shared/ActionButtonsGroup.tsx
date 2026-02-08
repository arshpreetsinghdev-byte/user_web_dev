import { memo } from "react";
import ActionButton from "./ActionButton";
import { cn } from "@/lib/utils";

interface ActionButtonsGroupProps {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  orientation?: "horizontal" | "vertical";
  align?: "left" | "center" | "right";
  className?: string;
}

const ActionButtonsGroup = memo(({
  primaryLabel,
  secondaryLabel,
  onPrimaryClick,
  onSecondaryClick,
  orientation = "horizontal",
  align = "left",
  className,
}: ActionButtonsGroupProps) => {
  const flexDirection = orientation === "vertical" ? "flex-col" : "flex-col sm:flex-row";
  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  return (
    <div className={cn("flex gap-3 sm:gap-4 items-center", flexDirection, justifyClass, className)}>
      <ActionButton onClick={onPrimaryClick}>
        {primaryLabel}
      </ActionButton>
      <ActionButton onClick={onSecondaryClick} variant="outline">
        {secondaryLabel}
      </ActionButton>
    </div>
  );
});

ActionButtonsGroup.displayName = "ActionButtonsGroup";

export default ActionButtonsGroup;
