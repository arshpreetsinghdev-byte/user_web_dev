"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import TimelineRow from "./TimelineRow";

interface AddStopButtonProps {
  onClick: () => void;
  mounted: boolean;
  className?: string
  variant?: "outline" | "filled";
}

const AddStopButton = memo(({ onClick, mounted, className, variant }: AddStopButtonProps) => (
  <TimelineRow
    icon={<Plus className={`w-7 h-7 sm:w-12 sm:h-12 text-primary ${variant == "outline" ? "text-black!" : ""}`} />}
    iconSize="small"
    showConnectorAbove={true}
    variant={variant}
    onIconClick={onClick}
  >
    
    <motion.button
      onClick={onClick}
      className="text-left text-xs lg:text-sm font-medium text-white hover:text-white/80 transition-colors flex items-center gap-2 w-30 h-9 lg:h-11"
      whileHover={mounted ? { x: 4 } : undefined}
      transition={{ duration: 0.2 }}
      type="button"
    >
      <span className={`${variant == "outline" ? "text-black!" : ""} w-full`}>Add Stop Over</span>
    </motion.button>
  </TimelineRow>
));

AddStopButton.displayName = "AddStopButton";

export default AddStopButton;
