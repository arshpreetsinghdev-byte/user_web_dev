import { memo } from "react";
import PageHeading from "@/components/shared/PageHeading";
import DescriptionText from "@/components/shared/DescriptionText";
import ActionButtonsGroup from "@/components/shared/ActionButtonsGroup";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";

interface HeroSectionProps {
  heading: string;
  headingHighlight: string;
  description: string;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  align?: "left" | "center";
  showButtonsOnMobile?: boolean;
  className?: string;
}

const HeroSection = memo(({
  heading,
  headingHighlight,
  description,
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryClick,
  onSecondaryClick,
  align = "center",
  showButtonsOnMobile = true,
  className,
}: HeroSectionProps) => {
  // Get dynamic content from operator params (fallback to hardcoded values)
  // const operatorSubheading = useOperatorParamsStore(
  //   (state) => state.data.hero_subheading || "Black Badge Transportation is a premium chauffeured car service built on trust, reliability, and personalized service."
  // );

  // Split the heading into main and highlight parts
  const mainHeading = heading;
  const highlightHeading = headingHighlight;

  const operatorSubheading = description;

  return (
    <div className={cn("w-full max-w-4xl lg:mx-0", className)}>
      <div className={cn("max-w-4xl mx-auto lg:mx-0", align === "center" ? "text-center" : "text-center lg:text-left")}>
        <PageHeading
          highlight={
            <motion.span
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="inline-block"
            >
              {highlightHeading}
            </motion.span>
          }
          align={align}
        >
          <motion.span
            initial={{ x: -60, opacity: 0, filter: "blur(10px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-block"
          >
            {mainHeading}
          </motion.span>
        </PageHeading>

        <DescriptionText
          align={align}
          className="mt-1.5 sm:mt-2 lg:mt-3"
        >
          {operatorSubheading}
        </DescriptionText>
      </div>

      <div className={cn(
        "max-w-4xl mx-auto lg:mx-0 mt-2 lg:mt-4",
        !showButtonsOnMobile && "hidden lg:block"
      )}>
        <ActionButtonsGroup
          primaryLabel={primaryButtonLabel}
          secondaryLabel={secondaryButtonLabel}
          onPrimaryClick={onPrimaryClick}
          onSecondaryClick={onSecondaryClick}
          align={align === "center" ? "center" : "left"}
        />
      </div>
    </div>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
