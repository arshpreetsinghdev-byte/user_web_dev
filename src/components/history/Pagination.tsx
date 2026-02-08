"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max visible
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(0);

            if (currentPage > 2) {
                pages.push("...");
            }

            // Show pages around current page
            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 3) {
                pages.push("...");
            }

            // Always show last page
            pages.push(totalPages - 1);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 py-8">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`p-2 rounded-lg transition-all ${currentPage === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                aria-label="Previous page"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-2 text-gray-400"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {pageNumber + 1}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className={`p-2 rounded-lg transition-all ${currentPage === totalPages - 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                aria-label="Next page"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
