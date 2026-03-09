import { ReactNode } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface SubRegionCardProps {
    imgSrc?: string;
    subComponent1?: ReactNode;
    subComponent2?: ReactNode;
    subComponent3?: ReactNode;
    subComponent4?: ReactNode;
    expandContent?: ReactNode;
    expanded?: boolean;
    selected?: boolean;
    className?: string;
    onClick?: () => void;
}

function SubRegionCard({
    imgSrc,
    subComponent1,
    subComponent2,
    subComponent3,
    subComponent4,
    expandContent,
    expanded = false,
    selected = false,
    className = "",
    onClick,
}: SubRegionCardProps) {

    const hasExpand = !!expandContent;

    return (
        <div
            className={`rounded-lg transition-shadow cursor-pointer shadow-sm ${className} ${selected ? "ring-1 ring-primary shadow-md bg-primary/5" : "ring-1 ring-border hover:shadow hover:ring-primary/20"
                } bg-white`}
        >
            <div className="flex items-center gap-4 pr-6 overflow-hidden rounded-t-lg" onClick={onClick}>
                {imgSrc && (
                    <div className="relative w-20 h-20 p-2 shrink-0">
                        <Image src={imgSrc} alt="sub-region" fill style={{ objectFit: "contain" }} />
                    </div>
                )}

                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center">
                            {subComponent1}
                        </div>
                        <div className="flex items-center gap-1">
                            {subComponent2}
                            {hasExpand && (
                                <ChevronDown
                                    size={18}
                                    className={`text-gray-400 transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-0.5">
                        <div className="max-w-[75%]">
                            {subComponent3}
                        </div>
                        <div className="flex items-center">
                            {subComponent4}
                        </div>
                    </div>
                </div>
            </div>

            {/* Accordion expand area */}
            <div
                className={`transition-all duration-200 ease-in-out ${expanded && hasExpand ? "max-h-125 opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
                <div className="px-5 pb-4 pt-3 border-t border-gray-100">
                    {expandContent}
                </div>
            </div>
        </div>
    );
}


export { SubRegionCard };