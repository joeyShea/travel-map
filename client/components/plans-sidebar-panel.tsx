"use client";

import Image from "next/image";
import { Notebook, X, MapPin } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { SavedActivityEntry } from "@/lib/trip-models";

interface PlansSidebarPanelProps {
  savedActivities: SavedActivityEntry[];
  onClose: () => void;
  onOpenTrip: (tripId: number) => void;
  onToggleSavedActivity: (tripId: number, activityId: number) => void;
}

export default function PlansSidebarPanel({
  savedActivities,
  onClose,
  onOpenTrip,
  onToggleSavedActivity,
}: PlansSidebarPanelProps) {
  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2">
          <Notebook className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Plans</h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/60 text-foreground transition-colors hover:bg-secondary"
          aria-label="Close plans panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Saved activities ({savedActivities.length})
          </p>

          {savedActivities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="text-sm font-medium text-foreground">No saved activities yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the notebook icon on any activity to save it here.
              </p>
            </div>
          ) : (
            savedActivities.map((entry) => (
              <div key={entry.key} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <button
                  type="button"
                  onClick={() => onOpenTrip(entry.tripId)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={entry.activity.image || entry.tripThumbnail} alt={entry.activity.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{entry.activity.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{entry.tripTitle}</p>
                    <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground break-words whitespace-normal">
                      <MapPin className="h-3 w-3" />
                      <span className="min-w-0">{entry.activity.address}</span>
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSavedActivity(entry.tripId, entry.activity.id)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                  aria-label="Remove from plans"
                  title="Remove from plans"
                >
                  <Notebook className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
