"use client";

import Image from "next/image";
import { ArrowLeft, BedDouble, Calendar, MapPin, Notebook, User } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { buildSavedActivityKey, type MapActivity, type MapLodging, type MapTrip } from "@/lib/trip-models";

interface FullScreenReviewProps {
    review: MapTrip;
    selectedActivity: MapActivity | null;
    selectedLodging: MapLodging | null;
    onBack: () => void;
    onSelectActivity: (activity: MapActivity | null) => void;
    onSelectLodging: (lodging: MapLodging | null) => void;
    onOpenAuthorProfile: (userId: number) => void;
    savedActivityKeys: ReadonlySet<string>;
    onToggleSavedActivity: (tripId: number, activity: MapActivity) => void;
}

export default function FullScreenReview({
    review,
    selectedActivity,
    selectedLodging,
    onBack,
    onSelectActivity,
    onSelectLodging,
    onOpenAuthorProfile,
    savedActivityKeys,
    onToggleSavedActivity,
}: FullScreenReviewProps) {
    return (
        <div className="flex h-full w-full flex-col border-r border-border bg-card">
            <div className="relative h-56 flex-shrink-0">
                <Image src={review.thumbnail} alt={review.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <button
                    onClick={onBack}
                    className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>
                <div className="absolute bottom-4 left-5 right-5">
                    <h1 className="text-balance text-3xl font-bold tracking-tight text-white">{review.title}</h1>
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-6 p-5">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button
                            onClick={() => onOpenAuthorProfile(review.ownerUserId)}
                            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                        >
                            <User className="h-3.5 w-3.5" />
                            {review.author}
                        </button>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {review.date}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            About This Trip
                        </h2>
                        <p className="text-sm leading-relaxed text-foreground/80">{review.description}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h2 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            <BedDouble className="h-3.5 w-3.5" />
                            Places Stayed
                        </h2>
                        {review.lodgings.length > 0 ? (
                            review.lodgings.map((lodging) => (
                                <button
                                    type="button"
                                    key={lodging.id}
                                    onClick={() => onSelectLodging(selectedLodging?.id === lodging.id ? null : lodging)}
                                    className={cn(
                                        "w-full rounded-xl border p-3 text-left transition-colors",
                                        selectedLodging?.id === lodging.id
                                            ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                                            : "border-border bg-secondary/30 hover:bg-secondary/50",
                                    )}
                                >
                                    <div className="grid gap-3 sm:grid-cols-[8rem,1fr]">
                                        <div className="relative h-28 w-full overflow-hidden rounded-lg sm:h-24">
                                            <Image
                                                src={lodging.image}
                                                alt={lodging.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-col gap-1.5">
                                            <h3 className="text-base font-semibold text-foreground">{lodging.title}</h3>
                                            <p className="text-xs text-muted-foreground break-words whitespace-normal">
                                                {lodging.address}
                                            </p>
                                            <p className="text-sm leading-relaxed text-foreground/70">
                                                {lodging.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No places stayed were added for this trip.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            Activities & Places
                        </h2>
                        {review.activities.length > 0 ? (
                            review.activities.map((activity) => {
                                const isSaved = savedActivityKeys.has(buildSavedActivityKey(review.id, activity.id));

                                return (
                                    <div
                                        key={activity.id}
                                        className={cn(
                                            "relative rounded-xl border p-3 transition-all",
                                            selectedActivity?.id === activity.id
                                                ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                                                : "border-border bg-secondary/40 hover:bg-secondary/70",
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSelectActivity(
                                                    selectedActivity?.id === activity.id ? null : activity,
                                                );
                                            }}
                                            className="flex w-full flex-col gap-3 pr-11 text-left"
                                        >
                                            <div className="relative h-40 w-full overflow-hidden rounded-lg">
                                                <Image
                                                    src={activity.image}
                                                    alt={activity.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex min-w-0 items-start justify-between gap-2">
                                                    <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground break-words">
                                                        {activity.title}
                                                    </h3>
                                                    <span className="inline-flex max-w-[65%] items-start gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground break-words whitespace-normal">
                                                        <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                                        <span className="min-w-0 break-words whitespace-normal">
                                                            {activity.address}
                                                        </span>
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-foreground/70">
                                                    {activity.description}
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onToggleSavedActivity(review.id, activity)}
                                            className={cn(
                                                "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                                                isSaved
                                                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                                                    : "border-border bg-background/80 text-muted-foreground hover:bg-secondary",
                                            )}
                                            aria-label={
                                                isSaved ? "Remove activity from plans" : "Save activity to plans"
                                            }
                                            title={isSaved ? "Remove from plans" : "Save to plans"}
                                        >
                                            <Notebook className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground">No activities were added for this trip.</p>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
