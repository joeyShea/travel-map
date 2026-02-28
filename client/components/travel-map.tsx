"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { travelReviews, type TravelReview, type Activity } from "@/lib/travel-data";
import SidebarPanel from "@/components/sidebar-panel";
import FullScreenReview from "@/components/full-screen-review";
import UserProfileModal, { type UserProfile } from "@/components/user-profile-modal";
import { MapPin, CircleUser } from "lucide-react";

// ─── Current user ─────────────────────────────────────────────────────────────
// Replace with a fetch/query from your user database when auth is wired up.

const CURRENT_USER: UserProfile = {
    name: "Joey Shea",
    initials: "JS",
    email: "joey@example.com",
    university: "University of California, Berkeley",
    bio: "Exploring national parks and mountain trails one trip at a time. Based in San Francisco — always planning the next adventure and writing up everything I find worth sharing.",
    trips: travelReviews.map((r) => ({
        id: r.id,
        title: r.title,
        thumbnail: r.thumbnail,
        date: r.date,
    })),
};

// ─── Author profile lookup ────────────────────────────────────────────────────
// Builds a profile from review data. Replace with a DB lookup when auth is live.

function buildAuthorProfile(authorName: string): UserProfile {
    const trips = travelReviews
        .filter((r) => r.author === authorName)
        .map((r) => ({ id: r.id, title: r.title, thumbnail: r.thumbnail, date: r.date }));
    const initials = authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return {
        name: authorName,
        initials,
        email: `${authorName.toLowerCase().replace(/\s+/g, ".")}@example.com`, // TODO: from DB
        university: "—",                                                         // TODO: from DB
        bio: "Travel writer sharing experiences from across the country.",        // TODO: from DB
        trips,
    };
}

// ─────────────────────────────────────────────────────────────────────────────

const MapView = dynamic(() => import("@/components/map-view"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-background">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    ),
});

interface ProfileState {
    profile: UserProfile;
    expandFrom: "top-right" | "left";
}

export default function TravelMap() {
    const [selectedReview, setSelectedReview] = useState<TravelReview | null>(null);
    const [fullScreenReview, setFullScreenReview] = useState<TravelReview | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [profileState, setProfileState] = useState<ProfileState | null>(null);

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

    const handleOpenAuthorProfile = useCallback((authorName: string) => {
        setProfileState({ profile: buildAuthorProfile(authorName), expandFrom: "left" });
    }, []);

    const showSidebar = !!selectedReview && !fullScreenReview;
    const showFullScreen = !!fullScreenReview;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {/* Top-right controls */}
            <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-card/90 backdrop-blur-sm px-4 py-2 border border-border shadow-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold tracking-tight text-foreground">Travel Map</span>
                </div>
                <button
                    onClick={() => setProfileState({ profile: CURRENT_USER, expandFrom: "top-right" })}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-sm hover:bg-card transition-colors"
                    aria-label="Open profile"
                >
                    <CircleUser className="h-5 w-5 text-foreground" />
                </button>
            </div>
            {/* TODO: this doesn't show rn */}
            {/* <div className="absolute right-4 top-4 z-30">
                <Link href="/trips">
                    <Button variant="outline" size="sm">
                        Add a trip
                    </Button>
                </Link>
            </div> */}

            <div className="flex h-full w-full">
                {/* Side panel */}
                <div
                    className="flex-shrink-0 h-full overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{ width: showSidebar ? 420 : showFullScreen ? 480 : 0 }}
                >
                    {showSidebar && (
                        <SidebarPanel
                            review={selectedReview!}
                            onClose={() => handleSelectReview(null)}
                            onViewFull={handleViewFull}
                            onOpenAuthorProfile={handleOpenAuthorProfile}
                        />
                    )}
                    {showFullScreen && (
                        <FullScreenReview
                            review={fullScreenReview!}
                            selectedActivity={selectedActivity}
                            onBack={handleBack}
                            onSelectActivity={handleSelectActivity}
                            onOpenAuthorProfile={handleOpenAuthorProfile}
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

            {/* Profile modal — key forces remount (re-triggers animation) on each open */}
            {profileState && (
                <UserProfileModal
                    key={profileState.profile.name}
                    profile={profileState.profile}
                    expandFrom={profileState.expandFrom}
                    onClose={() => setProfileState(null)}
                />
            )}
        </div>
    );
}
