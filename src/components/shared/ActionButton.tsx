import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

const ActionButton = memo(({ 
  onClick, 
  variant = "default", 
  children, 
  className,
  fullWidth = false,
  size = "lg"
}: ActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn(
        "py-3 px-4 sm:px-6 hover:scale-105 transition-transform",
        fullWidth ? "w-full" : "w-full sm:w-48",
        variant === "outline" && "text-primary",
        className
      )}
    >
      {children}
    </Button>
  );
});

ActionButton.displayName = "ActionButton";

export default ActionButton;
