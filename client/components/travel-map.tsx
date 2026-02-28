"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { travelReviews, type TravelReview, type Activity } from "@/lib/travel-data";
import SidebarPanel from "@/components/sidebar-panel";
import FullScreenReview from "@/components/full-screen-review";
import { Compass } from "lucide-react";

const MapView = dynamic(() => import("@/components/map-view"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Loading map...</span>
            </div>
        </div>
    ),
});

export default function TravelMap() {
    const [selectedReview, setSelectedReview] = useState<TravelReview | null>(null);
    const [fullScreenReview, setFullScreenReview] = useState<TravelReview | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const handleSelectReview = useCallback((review: TravelReview | null) => {
        setSelectedReview(review);
        setFullScreenReview(null);
        setSelectedActivity(null);
    }, []);

    const handleViewFull = useCallback((review: TravelReview) => {
        setFullScreenReview(review);
        setSelectedReview(null);
        setSelectedActivity(null);
    }, []);

    const handleBack = useCallback(() => {
        setFullScreenReview(null);
        setSelectedActivity(null);
    }, []);

    const handleSelectActivity = useCallback((activity: Activity | null) => {
        setSelectedActivity(activity);
    }, []);

    const showSidebar = !!selectedReview && !fullScreenReview;
    const showFullScreen = !!fullScreenReview;

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            {/* Logo */}
            <div
                className="absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm px-4 py-2 border border-border"
                style={{
                    left: showSidebar ? "calc(420px + 1rem)" : showFullScreen ? "calc(480px + 1rem)" : "1rem",
                    transition: "left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <Compass className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold tracking-tight text-foreground">Travel Map</span>
            </div>

            <div className="flex h-full w-full">
                {/* Sidebar Panel */}
                <div
                    className="flex-shrink-0 h-full overflow-hidden transition-[width] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ width: showSidebar ? 420 : showFullScreen ? 480 : 0 }}
                >
                    {selectedReview && !fullScreenReview && (
                        <SidebarPanel
                            review={selectedReview}
                            onClose={() => handleSelectReview(null)}
                            onViewFull={handleViewFull}
                        />
                    )}
                    {fullScreenReview && (
                        <FullScreenReview
                            review={fullScreenReview}
                            selectedActivity={selectedActivity}
                            onBack={handleBack}
                            onSelectActivity={handleSelectActivity}
                        />
                    )}
                </div>

                {/* Map */}
                <div className="flex-1 h-full min-w-0">
                    <MapView
                        reviews={travelReviews}
                        selectedReview={selectedReview}
                        fullScreenReview={fullScreenReview}
                        selectedActivity={selectedActivity}
                        onSelectReview={handleSelectReview}
                        onSelectActivity={handleSelectActivity}
                    />
                </div>
            </div>
        </div>
    );
}
