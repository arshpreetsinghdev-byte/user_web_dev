import { ReactNode } from "react";
import Image from "next/image";

interface SubRegionCardProps {
    imgSrc?: string;
    subComponent1?: ReactNode;
    subComponent2?: ReactNode;
    subComponent3?: ReactNode;
    subComponent4?: ReactNode;
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
    selected = false,
    className = "",
    onClick,
}: SubRegionCardProps) {


    return (
        <div
            className={`flex items-center gap-4 rounded-lg transition-shadow cursor-pointer shadow-sm ${className} ${selected ? "ring-1 ring-primary shadow-md bg-primary/5" : "ring-1 ring-border hover:shadow hover:ring-primary/20"
                } bg-white pr-6`}
            onClick={onClick}
        >
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
                    <div className="flex items-center">
                        {subComponent2}
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
    );
}


export { SubRegionCard };