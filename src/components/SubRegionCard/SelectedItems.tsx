import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";

interface Service {
  id: number;
  name: string;
  price: number;
}

interface SelectedItemsProps {
  imgSrc?: string;
  titleComponent?: ReactNode;
  priceComponent?: ReactNode;
  additionalServices?: Service[];
  title?: string;
  className?: string;

  /** layout applies from md and above */
  layout?: "vertical" | "horizontal";
}

function SelectedItems({
  imgSrc,
  titleComponent,
  priceComponent,
  additionalServices = [],
  title,
  className = "",
  layout = "vertical",
}: SelectedItemsProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <Card>
      <div
        className={cn(
          "",
          "px-4 pt-2 pb-4 md:p-4",
          className
        )}
      >
        {title && <h1 className="H2 mb-2">{title}</h1>}

        {/* MAIN LAYOUT */}
        <div
          className={cn(
            "flex gap-2",
            "flex-col",
            isHorizontal ? "md:flex-row" : "md:flex-col"
          )}
        >
          {/* PART 1 */}
          <div className={cn("flex gap-4 items-center", isHorizontal && "w-[50%] flex-1")}>
            {imgSrc && (
              <div className={cn("relative w-25 h-20 shrink-0")}>
                <Image
                  src={imgSrc}
                  alt="item"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <div className="flex flex-col">
              <div className="p-1 flex items-center">{titleComponent}</div>
              <div className="p-1 flex items-center">{priceComponent}</div>
            </div>
          </div>

          {/* DIVIDER */}
          {additionalServices.length > 0 && (
            <div
              className={cn(
                "bg-gray-100 rounded-full",
                "h-0.75 w-full my-2",
                isHorizontal && "m-2 md:w-0.75 md:h-auto md:self-stretch md:my-0"
              )}
            />
          )}

          {/* PART 3 */}
          {additionalServices.length > 0 && (
            <div className={cn(isHorizontal && "px-4 md:min-w-50 flex-1")}>
              <h2 className="H2 mb-2 max-sm:text-lg!">Additional Services</h2>

              {additionalServices.map((service, i) => (
                <div
                  key={service.id}
                  className="flex justify-between text-base text-[#343434]"
                >
                  <span>
                    {i + 1}. {service.name}
                  </span>
                  <span>{service.price === 0 ? "Free" : `${useOperatorParamsStore.getState().data?.user_web_config?.currency || useOperatorParamsStore.getState().data?.user_web_config?.currency_symbol || '₹'}${service.price}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export { SelectedItems };
