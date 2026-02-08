import { UserRound, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TitleBlockProps {
    title: string;
    capacity?: number;
    minutes?: number;
}

function TitleBlock({ title, capacity, minutes }: TitleBlockProps) {
    return (
        <div className='flex flex-col gap-1'>
            <div className="text-left w-full items-center flex gap-2">
                <h1 className="H3">
                    {title}
                </h1>
                {capacity && (
                    <div className="inline-flex items-center">
                        <UserRound className="text-primary" size={16} />
                        <span className="ml-1 text-lg text-primary font-semibold">{capacity}</span>
                    </div>
                )}
            </div>
            {/* <h3 className="subtitle">
                {minutes ? minutes : '--'} min until arrival
            </h3> */}
        </div>
    );
}


function DescriptionBlock({ text }: { text: string }) {
    return (
        <p className="desscription">
            {text}
        </p>
    );
}

function PriceBlock({ price, oldPrice, currencySymbol = "₹", className }: { price: number; oldPrice?: number; currencySymbol?: string; className?: string }) {
    return (
        <div className={cn(className, "text-right")}>
            {oldPrice && (
                <div className="text-xs text-gray-400 line-through">
                    {currencySymbol}{oldPrice?.toFixed(2)}
                </div>
            )}
            <div className="H3 text-primary!">
                {currencySymbol}{price?.toFixed(2)}
            </div>
        </div>
    );
}

function CheckBox({
    checked,
    onCheckedChange,
}: {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={checked}
            onClick={(e) => {
                e.stopPropagation();
                onCheckedChange?.(!checked);
            }}
            className={cn(
                "cursor-pointer select-none",
                "flex h-5 w-5 items-center justify-center rounded",
                "border-[1.5px] border-gray-400/80",
                checked ? "bg-primary border-primary" : "bg-white"
            )}
        >
            {checked && <Check size={12} className="text-white" />}
        </button>
    );
}

export { TitleBlock, DescriptionBlock, PriceBlock, CheckBox };