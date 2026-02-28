"use client"

import Image from "next/image"
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react"
import type { MapActivity, MapTrip } from "@/lib/trip-models"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface FullScreenReviewProps {
  review: MapTrip
  selectedActivity: MapActivity | null
  onBack: () => void
  onSelectActivity: (activity: MapActivity | null) => void
  onOpenAuthorProfile: (userId: number) => void
}

export default function FullScreenReview({
  review,
  selectedActivity,
  onBack,
  onSelectActivity,
  onOpenAuthorProfile,
}: FullScreenReviewProps) {
  return (
    <div className="flex h-full w-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="relative h-64 flex-shrink-0">
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
          <div className="mt-2 flex items-center gap-4 text-sm text-white/70">
            <button
              onClick={() => onOpenAuthorProfile(review.ownerUserId)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              {review.author}
            </button>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {review.date}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 p-5">
          {/* Long-form description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              About This Trip
            </h2>
            <p className="text-sm leading-relaxed text-foreground/80">{review.description}</p>
          </div>

          {/* Activities */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Activities & Places
            </h2>
            {review.activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => onSelectActivity(selectedActivity?.id === activity.id ? null : activity)}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-3 text-left transition-all",
                  selectedActivity?.id === activity.id
                    ? "border-primary bg-primary/8 shadow-sm shadow-primary/10"
                    : "border-border bg-secondary/40 hover:bg-secondary/70"
                )}
              >
                <div className="relative h-40 w-full overflow-hidden rounded-lg">
                  <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-foreground">{activity.title}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground flex-shrink-0">
                      <MapPin className="h-3 w-3" />
                      {activity.lat.toFixed(2)}, {activity.lng.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/70">{activity.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
