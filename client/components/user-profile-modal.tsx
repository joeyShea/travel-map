"use client";

import Image from "next/image";
import { X, Mail, GraduationCap, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ────────────────────────────────────────────────────────────────────
// Swap MOCK_PROFILE in travel-map.tsx with real data from your DB/auth context.

export interface TripEntry {
    id: number;
    title: string;
    thumbnail: string;
    date: string;
}

export interface UserProfile {
    userId: number;
    name: string;
    initials: string;
    email: string;
    university: string;
    bio: string;
    trips: TripEntry[];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface UserProfileModalProps {
    profile: UserProfile;
    onClose: () => void;
    onSelectTrip?: (tripId: number) => void;
    canManageTrips?: boolean;
    deletingTripId?: number | null;
    onDeleteTrip?: (tripId: number) => void;
    expandFrom?: "top-right" | "left";
}

export default function UserProfileModal({
    profile,
    onClose,
    onSelectTrip,
    canManageTrips = false,
    deletingTripId = null,
    onDeleteTrip,
    expandFrom = "top-right",
}: UserProfileModalProps) {
    const animClass = expandFrom === "left" ? "modal-expand-left" : "modal-expand";

    return (
        <>
            {/* Backdrop */}
            <div
                className="backdrop-fade fixed inset-0 z-[1500] bg-foreground/10 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`${animClass} fixed inset-3 sm:inset-6 z-[1600] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden`}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-border transition-colors"
                    aria-label="Close profile"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <ScrollArea className="flex-1">
                    <div className="p-5 sm:p-10">
                        {/* User header */}
                        <div className="flex items-start gap-4 sm:gap-6 mb-6">
                            <div className="flex h-14 w-14 sm:h-20 sm:w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl sm:text-2xl font-bold text-primary-foreground">
                                {profile.initials}
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                    {profile.name}
                                </h1>
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                    {profile.email}
                                </p>
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                                    {profile.university}
                                </p>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="max-w-2xl text-sm leading-relaxed text-foreground/75 mb-8">
                            {profile.bio}
                        </p>

                        <div className="h-px bg-border mb-8" />

                        {/* Trips */}
                        {profile.trips.length > 0 ? (
                            <>
                                <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                    Trips
                                </h2>
                                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                                    {profile.trips.map((trip) => (
                                        <div
                                            key={trip.id}
                                            className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background hover:border-primary/30 transition-colors"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSelectTrip?.(trip.id);
                                                    onClose();
                                                }}
                                                className="text-left"
                                            >
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={trip.thumbnail}
                                                        alt={trip.title}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="px-3 py-2.5">
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {trip.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {trip.date}
                                                    </p>
                                                </div>
                                            </button>
                                            {canManageTrips ? (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onDeleteTrip?.(trip.id);
                                                    }}
                                                    disabled={deletingTripId === trip.id}
                                                    className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-70"
                                                    aria-label={`Delete ${trip.title}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No trips posted yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </>
    );
}
