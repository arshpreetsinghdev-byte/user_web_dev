import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DescriptionTextProps {
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  maxWidth?: string;
}

const DescriptionText = memo(({ 
  children, 
  align = "left", 
  className,
  maxWidth = "max-w-xl 2xl:max-w-full"
}: DescriptionTextProps) => {
  const alignmentClass = {
    left: "text-center lg:text-left mx-auto lg:mx-0",
    center: "text-center mx-auto",
    right: "text-center lg:text-right mx-auto lg:mr-0 lg:ml-auto",
  }[align];

  return (
    <p
      className={cn(
        "font-normal text-xs lg:text-sm xl:text-base leading-[130%] tracking-[-0.32px] text-gray-700",
        maxWidth,
        alignmentClass,
        className
      )}
    >
      {children}
    </p>
  );
});

DescriptionText.displayName = "DescriptionText";

export default DescriptionText;
