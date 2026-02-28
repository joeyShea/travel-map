"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchSidebarPanelProps {
    query: string;
    onClose: () => void;
}

const FILTER_SECTIONS = [
    {
        title: "Trip Type",
        options: ["City", "Nature", "Road Trip", "Weekend"],
    },
    {
        title: "Budget",
        options: ["Budget", "Mid-range", "Luxury"],
    },
    {
        title: "Travel Style",
        options: ["Solo", "Friends", "Family", "Student"],
    },
];

export default function SearchSidebarPanel({ query, onClose }: SearchSidebarPanelProps) {
    return (
        <div className="flex h-full w-full flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Search Trips</h2>
                </div>
                <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/60 text-foreground transition-colors hover:bg-secondary"
                    aria-label="Close search panel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="flex flex-col gap-6 p-5">
                    <div className="rounded-xl border border-border bg-secondary/30 p-4">
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Current Query</p>
                        <p className="mt-2 text-sm text-foreground">
                            {query.trim() ? `"${query.trim()}"` : "Start typing to search"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Filter Options</h3>
                    </div>

                    {FILTER_SECTIONS.map((section) => (
                        <div key={section.title} className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-foreground">{section.title}</p>
                            <div className="flex flex-wrap gap-2">
                                {section.options.map((option) => (
                                    <Button key={option} variant="outline" size="sm" className="rounded-full">
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="rounded-xl border border-dashed border-border p-4">
                        <p className="text-sm font-medium text-foreground">Results will appear here</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Search and filters are visual only for now, as requested.
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
