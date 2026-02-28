"use client"

import Image from "next/image"
import { X, ArrowRight, MapPin, Calendar } from "lucide-react"
import type { TravelReview } from "@/lib/travel-data"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarPanelProps {
  review: TravelReview
  onClose: () => void
  onViewFull: (review: TravelReview) => void
  onOpenAuthorProfile: (authorName: string) => void
}

export default function SidebarPanel({ review, onClose, onViewFull, onOpenAuthorProfile }: SidebarPanelProps) {
  return (
    <div className="flex h-full w-[420px] flex-col bg-card border-r border-border">
      {/* Header image */}
      <div className="relative h-56 flex-shrink-0">
        <Image src={review.thumbnail} alt={review.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
              onClick={() => onOpenAuthorProfile(review.author)}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              {review.author}
            </button>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {review.date}
            </span>
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-foreground/80">{review.summary}</p>

          {/* Activities preview */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Activities
            </h3>
            {review.activities.map((activity) => (
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
              </div>
            ))}
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
