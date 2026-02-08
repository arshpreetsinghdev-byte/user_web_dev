import React, { memo, type ReactNode } from "react";

// Update interface
interface TimelineRowProps {
  icon: ReactNode;
  iconSize?: "large" | "small";
  showConnectorAbove?: boolean;
  showConnectorBelow?: boolean;
  children: ReactNode;
  variant?: "outline" | "filled";
  onIconClick?: () => void;
}

const TimelineRow = memo(({
  icon,
  iconSize = "large",
  showConnectorAbove = false,
  showConnectorBelow = true,
  children,
  variant,
  onIconClick,
}: TimelineRowProps) => (
  <div className="flex items-stretch">
    {/* Icon Column */}
    <div className="flex flex-col items-center mr-2 lg:mr-4 w-7 lg:w-10">
      {/* Connector above */}
      {showConnectorAbove && <div className={`w-0.5 flex-1 min-h-2 bg-primary-foreground/30 ${variant === "outline" ? "bg-border!" : ""}`} />}
      {!showConnectorAbove && <div className="flex-1" />}

      {/* Icon */}
      <div
        onClick={onIconClick}
        className={`${iconSize === "large" ? "w-7 h-7 lg:w-10 lg:h-10" : "w-5 h-5 lg:w-8 lg:h-8"
          } rounded-full bg-white flex items-center justify-center shrink-0 z-10 ${variant === "outline" ? "bg-border!" : ""} ${onIconClick ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
      >
        {icon}
      </div>

      {/* Connector below */}
      {showConnectorBelow && <div className={`w-0.5 flex-1 min-h-2 bg-primary-foreground/30 ${variant === "outline" ? "bg-border!" : ""}`} />}
      {!showConnectorBelow && <div className="flex-1" />}
    </div>

    {/* Content Column */}
    <div className="flex-1 py-1 lg:py-1">{children}</div>
  </div>
));

TimelineRow.displayName = "TimelineRow";

export default TimelineRow;
