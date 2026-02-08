import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeadingProps {
  children: ReactNode;
  highlight?: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

const PageHeading = memo(({ children, highlight, align = "left", className }: PageHeadingProps) => {
  const alignmentClass = {
    left: "text-center lg:text-left",
    center: "text-center",
    right: "text-center lg:text-right",
  }[align];

  return (
    <h1
      className={cn(
        "font-bold text-2xl lg:text-[36px] xl:text-[42px] leading-[123%] tracking-[-2.24px]",
        alignmentClass,
        className
      )}
    >
      {children}
      {highlight && (
        <>
          <br />
          <span className="text-primary">{highlight}</span>
        </>
      )}
    </h1>
  );
});

PageHeading.displayName = "PageHeading";

export default PageHeading;
