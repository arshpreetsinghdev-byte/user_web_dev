"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-3 sm:space-x-4 sm:space-y-0 relative",
                month: "space-y-3",
                month_caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-sm font-semibold text-neutral-900",
                nav: "flex items-center",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 top-1 z-10"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 top-1 z-10"
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex w-full mb-1",
                weekday: "text-neutral-500 rounded-md w-8 font-medium text-[0.75rem] text-center",
                week: "flex w-full mt-0.5",
                day: "p-0 text-black",
                day_button: cn(
                    "h-7 w-8 text-center text-xs p-0 flex items-center justify-center transition-all rounded-md",
                    "hover:bg-primary/10 focus:bg-primary/10 outline-none",
                    "hover:opacity-100 focus:opacity-100",
                    "aria-selected:bg-primary aria-selected:text-black aria-selected:font-semibold",
                    "aria-selected:hover:bg-primary aria-selected:hover:text-black",
                    "aria-selected:focus:bg-primary aria-selected:focus:text-black",
                    "data-[today]:bg-primary/10 data-[today]:font-bold data-[today]:text-black data-[today]:opacity-100"
                ),
                selected: "bg-primary text-white font-semibold rounded-md",
                today: "text-black font-bold",
                outside: "text-neutral-300 opacity-50",
                disabled: "text-neutral-300 opacity-50 cursor-not-allowed",
                hidden: "invisible",
                range_start: "",
                range_end: "",
                range_middle: "bg-accent/50",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") return <ChevronLeft className="h-4 w-4" />
                    return <ChevronRight className="h-4 w-4" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
