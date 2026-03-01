"use client"

import Image from "next/image"
import { ArrowLeft, MapPin, Calendar, User, Notebook, BedDouble } from "lucide-react"
import { buildSavedActivityKey, type MapActivity, type MapLodging, type MapTrip } from "@/lib/trip-models"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface FullScreenReviewProps {
  review: MapTrip
  selectedActivity: MapActivity | null
  selectedLodging: MapLodging | null
  onBack: () => void
  onSelectActivity: (activity: MapActivity | null) => void
  onSelectLodging: (lodging: MapLodging | null) => void
  onOpenAuthorProfile: (userId: number) => void
  savedActivityKeys: ReadonlySet<string>
  onToggleSavedActivity: (tripId: number, activity: MapActivity) => void
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
    <div className="flex h-full w-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="relative h-56 flex-shrink-0">
        <Image src={review.thumbnail} alt={review.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-3xl font-bold tracking-tight text-white text-balance">
            {review.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 p-5">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => onOpenAuthorProfile(review.ownerUserId)}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              {review.author}
            </button>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {review.date}
            </span>
          </div>

          {/* Long-form description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              About This Trip
            </h2>
            <p className="text-sm leading-relaxed text-foreground/80">{review.description}</p>
          </div>

          {/* Places stayed */}
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
                      : "border-border bg-secondary/30 hover:bg-secondary/50"
                  )}
                >
                  <div className="grid gap-3 sm:grid-cols-[8rem,1fr]">
                    <div className="relative h-28 w-full overflow-hidden rounded-lg sm:h-24">
                      <Image src={lodging.image} alt={lodging.title} fill className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <h3 className="text-base font-semibold text-foreground">{lodging.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">{lodging.address}</p>
                      <p className="text-sm leading-relaxed text-foreground/70">{lodging.description}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No places stayed were added for this trip.</p>
            )}
          </div>

          {/* Activities */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Activities & Places
            </h2>
            {review.activities.length > 0 ? (
              review.activities.map((activity) => {
                const isSaved = savedActivityKeys.has(buildSavedActivityKey(review.id, activity.id))

                return (
                  <div
                    key={activity.id}
                    className={cn(
                      "relative rounded-xl border p-3 transition-all",
                      selectedActivity?.id === activity.id
                        ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                        : "border-border bg-secondary/40 hover:bg-secondary/70"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectActivity(selectedActivity?.id === activity.id ? null : activity)}
                      className="flex w-full flex-col gap-3 text-left"
                    >
                      <div className="relative h-40 w-full overflow-hidden rounded-lg">
                        <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2 pr-11">
                          <h3 className="text-base font-semibold text-foreground">{activity.title}</h3>
                          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {activity.lat.toFixed(2)}, {activity.lng.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground/70">{activity.description}</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleSavedActivity(review.id, activity)}
                      className={cn(
                        "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                        isSaved
                          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-border bg-background/80 text-muted-foreground hover:bg-secondary"
                      )}
                      aria-label={isSaved ? "Remove activity from plans" : "Save activity to plans"}
                      title={isSaved ? "Remove from plans" : "Save to plans"}
                    >
                      <Notebook className="h-4 w-4" />
                    </button>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No activities were added for this trip.</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
