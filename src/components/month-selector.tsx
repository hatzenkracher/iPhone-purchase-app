"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MONTHS = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];

const MONTH_NAMES = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export function MonthSelector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMonth = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    // Parse current month and year
    const [year, month] = currentMonth.split("-").map(Number);
    const [selectedYear, setSelectedYear] = useState(year);
    const [open, setOpen] = useState(false);

    const handleMonthSelect = (monthIndex: number) => {
        const newMonth = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
        router.push(`/monthly-report?month=${newMonth}`);
        setOpen(false);
    };

    const displayText = `${MONTH_NAMES[month - 1]} ${year}`;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayText}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                    {/* Year selector */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedYear(selectedYear - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium">
                            {selectedYear}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedYear(selectedYear + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((monthName, index) => {
                            const isSelected = selectedYear === year && index === month - 1;
                            return (
                                <Button
                                    key={index}
                                    variant={isSelected ? "default" : "outline"}
                                    className="h-9"
                                    onClick={() => handleMonthSelect(index)}
                                >
                                    {monthName}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
