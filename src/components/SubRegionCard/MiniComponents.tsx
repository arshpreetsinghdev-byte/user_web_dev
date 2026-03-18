import { UserRound, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";

interface TitleBlockProps {
    title: string;
    capacity?: number;
    minutes?: number;
}

function TitleBlock({ title, capacity, minutes }: TitleBlockProps) {
    return (
        <div className='flex flex-col gap-1 min-w-0'>
            <div className="text-left w-full items-center flex flex-wrap gap-x-2 gap-y-0.5 min-w-0">
                <h1 className="H3 wrap-break-word">
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
    const ref = useRef<HTMLParagraphElement>(null);
    const [isClamped, setIsClamped] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (el) setIsClamped(el.scrollHeight > el.clientHeight);
    }, [text]);

    return (
        <span className="block">
            <p ref={ref} className={`desscription break-words ${expanded ? "" : "line-clamp-2"}`}>
                {text}
            </p>
            {(isClamped || expanded) && (
                <button
                    type="button"
                    className="text-primary text-xs font-medium select-none focus:outline-none"
                    onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
                >
                    {expanded ? "...less" : "...more"}
                </button>
            )}
        </span>
    );
}

function PriceBlock({ price, oldPrice, currencySymbol, fareText, oldFareText, className }: { price?: number; oldPrice?: number; currencySymbol?: string; fareText?: string; oldFareText?: string; className?: string }) {
    const defaultSymbol = useOperatorParamsStore.getState().data?.user_web_config?.currency ||
        useOperatorParamsStore.getState().data?.user_web_config?.currency_symbol ||
        '₹';
    const symbol = currencySymbol || defaultSymbol;
    return (
        <div className={cn(className, "text-right")}>
            {(oldFareText || oldPrice) && (
                <div className="text-xs text-gray-400 line-through">
                    {oldFareText || `${symbol}${oldPrice?.toFixed(2)}`}
                </div>
            )}
            <div className="H3 text-primary!">
                {fareText || `${symbol}${price?.toFixed(2)}`}
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