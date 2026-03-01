"use client"

import Image from "next/image"
import { X, ArrowRight, MapPin, Calendar, Notebook, ChevronLeft, ChevronRight, User, BedDouble } from "lucide-react"
import { buildSavedActivityKey, type MapActivity, type MapTrip } from "@/lib/trip-models"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarPanelProps {
  review: MapTrip
  onClose: () => void
  onViewFull: (trip: MapTrip) => void
  onOpenAuthorProfile: (userId: number) => void
  savedActivityKeys: ReadonlySet<string>
  onToggleSavedActivity: (tripId: number, activity: MapActivity) => void
  locationTripCount: number
  locationTripPosition: number
  onShowPreviousTripAtLocation: () => void
  onShowNextTripAtLocation: () => void
  canShowPreviousTripAtLocation: boolean
  canShowNextTripAtLocation: boolean
}

export default function SidebarPanel({
  review,
  onClose,
  onViewFull,
  onOpenAuthorProfile,
  savedActivityKeys,
  onToggleSavedActivity,
  locationTripCount,
  locationTripPosition,
  onShowPreviousTripAtLocation,
  onShowNextTripAtLocation,
  canShowPreviousTripAtLocation,
  canShowNextTripAtLocation,
}: SidebarPanelProps) {
  return (
    <div className="flex h-full w-full flex-col bg-card border-r border-border">
      {/* Header image */}
      <div className="relative h-56 flex-shrink-0">
        <Image src={review.thumbnail} alt={review.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {locationTripCount > 1 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/45 p-1 text-white backdrop-blur-sm">
            <button
              type="button"
              onClick={onShowPreviousTripAtLocation}
              disabled={!canShowPreviousTripAtLocation}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/15 disabled:cursor-default disabled:opacity-40"
              aria-label="Show previous trip at this location"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-1 text-xs font-medium">
              {locationTripPosition}/{locationTripCount}
            </span>
            <button
              type="button"
              onClick={onShowNextTripAtLocation}
              disabled={!canShowNextTripAtLocation}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/15 disabled:cursor-default disabled:opacity-40"
              aria-label="Show next trip at this location"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-colors hover:bg-black/60"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h2 className="text-2xl font-semibold tracking-tight text-white text-balance">
            {review.title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-5 p-5">
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

          {/* Summary */}
          <p className="text-sm leading-relaxed text-foreground/80">{review.summary}</p>

          {/* Stays preview */}
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" />
              Places Stayed
            </h3>
            {review.lodgings.length > 0 ? (
              review.lodgings.map((lodging) => (
                <div
                  key={lodging.id}
                  className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3 transition-colors hover:bg-secondary/60"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={lodging.image} alt={lodging.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{lodging.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{lodging.address}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No places stayed were added for this trip.</p>
            )}
          </div>

          {/* Activities preview */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Activities
            </h3>
            {review.activities.length > 0 ? (
              review.activities.map((activity) => {
                const isSaved = savedActivityKeys.has(buildSavedActivityKey(review.id, activity.id))

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3 transition-colors hover:bg-secondary"
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {activity.lat.toFixed(2)}, {activity.lng.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSavedActivity(review.id, activity)}
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isSaved
                          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-border bg-background/80 text-muted-foreground hover:bg-secondary"
                      }`}
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

          {/* View full button */}
          <button
            onClick={() => onViewFull(review)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            View Full Review
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </ScrollArea>
    </div>
  )
}
