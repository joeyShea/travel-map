"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImagePlus, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import PlacePicker, { type PlaceOption } from "@/components/place-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTrip, uploadImage } from "@/lib/api-client";
import { AVAILABLE_TAGS, BANNER_PLACEHOLDER } from "@/lib/trip-constants";
import type { TripDuration, TripVisibility } from "@/lib/api-types";

interface StopDraft {
  id: string;
  title: string;
  notes: string;
  cost: string;
  imageUrl: string;
  location: PlaceOption | null;
}

function clean(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function formatPreviewDate(value: string): string {
  if (!value) {
    return "No date yet";
  }

  const monthInputMatch = /^(\d{4})-(\d{2})$/.exec(value);
  if (!monthInputMatch) {
    return value;
  }

  const [, year, month] = monthInputMatch;
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  return new Date(Number(year), monthIndex, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function makeStopDraft(): StopDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    notes: "",
    cost: "",
    imageUrl: "",
    location: null,
  };
}

export default function TripsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { status, isStudent } = useAuth();

  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tripLocation, setTripLocation] = useState<PlaceOption | null>(null);
  const [cost, setCost] = useState("");
  const [duration, setDuration] = useState<TripDuration>("multiday trip");
  const [date, setDate] = useState("");
  const [visibility, setVisibility] = useState<TripVisibility>("public");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [lodgings, setLodgings] = useState<StopDraft[]>([]);
  const [activities, setActivities] = useState<StopDraft[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signup");
    }
    if (status === "authenticated" && !isStudent) {
      router.replace("/");
    }
  }, [isStudent, router, status]);

  if (status !== "authenticated" || !isStudent) {
    return null;
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag);
      }
      return [...current, tag];
    });
  }

  function addStop(kind: "lodging" | "activity") {
    const stop = makeStopDraft();
    if (kind === "lodging") {
      setLodgings((current) => [...current, stop]);
      return;
    }
    setActivities((current) => [...current, stop]);
  }

  function updateStop(
    kind: "lodging" | "activity",
    id: string,
    patch: Partial<StopDraft>,
  ) {
    if (kind === "lodging") {
      setLodgings((current) => current.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
      return;
    }

    setActivities((current) => current.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));
  }

  function removeStop(kind: "lodging" | "activity", id: string) {
    if (kind === "lodging") {
      setLodgings((current) => current.filter((stop) => stop.id !== id));
      return;
    }

    setActivities((current) => current.filter((stop) => stop.id !== id));
  }

  async function handleCreateTrip() {
    setError("");

    if (!title.trim()) {
      setError("Add a trip title before posting.");
      return;
    }

    if (!tripLocation) {
      setError("Choose a trip location before posting.");
      return;
    }

    setIsSavingTrip(true);

    try {
      await createTrip({
        title: title.trim(),
        thumbnail_url: clean(coverImage),
        description: clean(description),
        latitude: `${tripLocation.latitude}`,
        longitude: `${tripLocation.longitude}`,
        cost: clean(cost),
        duration,
        date: clean(date),
        visibility,
        tags: selectedTags,
        lodgings: lodgings
          .filter((stop) => stop.title.trim())
          .map((stop) => ({
            title: stop.title.trim(),
            description: clean(stop.notes),
            address: stop.location?.address,
            latitude: stop.location ? `${stop.location.latitude}` : undefined,
            longitude: stop.location ? `${stop.location.longitude}` : undefined,
            cost: clean(stop.cost),
            thumbnail_url: clean(stop.imageUrl),
          })),
        activities: activities
          .filter((stop) => stop.title.trim())
          .map((stop) => ({
            title: stop.title.trim(),
            description: clean(stop.notes),
            location: stop.location?.label,
            address: stop.location?.address,
            latitude: stop.location ? `${stop.location.latitude}` : undefined,
            longitude: stop.location ? `${stop.location.longitude}` : undefined,
            cost: clean(stop.cost),
            thumbnail_url: clean(stop.imageUrl),
          })),
      });

      router.push(returnTo);
      return;
    } catch {
      setError("Could not post this trip right now. Please try again.");
    } finally {
      setIsSavingTrip(false);
    }
  }

  return (
    <main className="h-screen overflow-y-auto bg-[linear-gradient(180deg,#f7efe2_0%,#f4f4ef_55%,#eef3f6_100%)] px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 lg:flex-row">
        <section className="w-full rounded-3xl border border-stone-200/80 bg-white/85 p-5 shadow-xl shadow-stone-200/30 backdrop-blur-sm md:p-7 lg:w-2/3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Trip Composer</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">Craft your next post</h1>
            </div>
            <Link href={returnTo}>
              <Button variant="outline" className="rounded-full">
                Back to Map
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Cover Image</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100">
                  <ImagePlus className="h-4 w-4 text-amber-700" />
                  {isUploadingImage ? "Uploading..." : "Upload cover image"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    className="sr-only"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        setCoverImage("");
                        return;
                      }

                      try {
                        setError("");
                        setIsUploadingImage(true);
                        const imageUrl = await uploadImage(file, "trips/cover");
                        setCoverImage(imageUrl);
                      } catch {
                        setError("Could not upload cover image. Please try again.");
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }}
                  />
                </label>
                <p className="text-sm text-stone-500">
                  {coverImage ? "Cover selected. Preview updates live." : "No cover yet. Add one to set the tone."}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title your trip..."
                className="w-full border-b border-stone-200 bg-transparent pb-3 text-4xl font-semibold tracking-tight text-stone-900 outline-none placeholder:text-stone-300"
              />

              <PlacePicker
                label="Trip location"
                placeholder="Search city, park, landmark..."
                value={tripLocation}
                onChange={setTripLocation}
              />

              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={7}
                placeholder="Tell the story: what you did, what surprised you, and what someone should know before visiting..."
                className="resize-none rounded-2xl border-stone-200 bg-white text-base leading-relaxed"
              />
            </div>

            <div className="grid gap-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Date</label>
                <Input type="month" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Budget</label>
                <Input value={cost} onChange={(event) => setCost(event.target.value)} placeholder="$1450" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Duration</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value as TripDuration)}
                >
                  <option value="multiday trip">multiday trip</option>
                  <option value="day trip">day trip</option>
                  <option value="overnight trip">overnight trip</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Visibility</label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as TripVisibility)}
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="friends">friends</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                          selected
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-900">Places you stayed</h2>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => addStop("lodging")}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add stay
                </Button>
              </div>

              {lodgings.length === 0 ? (
                <p className="text-sm text-stone-500">Add hotels, campgrounds, or anywhere you stayed.</p>
              ) : null}

              <div className="space-y-4">
                {lodgings.map((stop, index) => (
                  <div key={stop.id} className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-stone-700">Stay #{index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeStop("lodging", stop.id)}
                        className="rounded-full p-1 text-stone-400 transition-colors hover:bg-white hover:text-stone-700"
                        aria-label="Remove stay"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3">
                      <Input
                        value={stop.title}
                        onChange={(event) => updateStop("lodging", stop.id, { title: event.target.value })}
                        placeholder="Name this stay"
                      />

                      <PlacePicker
                        label="Location"
                        placeholder="Search where this stay was"
                        value={stop.location}
                        onChange={(location) => updateStop("lodging", stop.id, { location })}
                      />

                      <Textarea
                        value={stop.notes}
                        rows={3}
                        onChange={(event) => updateStop("lodging", stop.id, { notes: event.target.value })}
                        placeholder="What made this place good (or bad)?"
                        className="resize-none"
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          value={stop.cost}
                          onChange={(event) => updateStop("lodging", stop.id, { cost: event.target.value })}
                          placeholder="Cost"
                        />
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100">
                          <ImagePlus className="h-4 w-4 text-amber-700" />
                          {isUploadingImage ? "Uploading..." : "Add photo"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingImage}
                            className="sr-only"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) {
                                updateStop("lodging", stop.id, { imageUrl: "" });
                                return;
                              }

                              try {
                                setError("");
                                setIsUploadingImage(true);
                                const imageUrl = await uploadImage(file, "trips/lodging");
                                updateStop("lodging", stop.id, { imageUrl });
                              } catch {
                                setError("Could not upload lodging image. Please try again.");
                              } finally {
                                setIsUploadingImage(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-900">Things you did</h2>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => addStop("activity")}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add activity
                </Button>
              </div>

              {activities.length === 0 ? (
                <p className="text-sm text-stone-500">Add museums, hikes, restaurants, or events.</p>
              ) : null}

              <div className="space-y-4">
                {activities.map((stop, index) => (
                  <div key={stop.id} className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-stone-700">Activity #{index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeStop("activity", stop.id)}
                        className="rounded-full p-1 text-stone-400 transition-colors hover:bg-white hover:text-stone-700"
                        aria-label="Remove activity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3">
                      <Input
                        value={stop.title}
                        onChange={(event) => updateStop("activity", stop.id, { title: event.target.value })}
                        placeholder="Name this activity"
                      />

                      <PlacePicker
                        label="Location"
                        placeholder="Search where this activity was"
                        value={stop.location}
                        onChange={(location) => updateStop("activity", stop.id, { location })}
                      />

                      <Textarea
                        value={stop.notes}
                        rows={3}
                        onChange={(event) => updateStop("activity", stop.id, { notes: event.target.value })}
                        placeholder="What should people know before going?"
                        className="resize-none"
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          value={stop.cost}
                          onChange={(event) => updateStop("activity", stop.id, { cost: event.target.value })}
                          placeholder="Cost"
                        />
                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100">
                          <ImagePlus className="h-4 w-4 text-amber-700" />
                          {isUploadingImage ? "Uploading..." : "Add photo"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingImage}
                            className="sr-only"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) {
                                updateStop("activity", stop.id, { imageUrl: "" });
                                return;
                              }

                              try {
                                setError("");
                                setIsUploadingImage(true);
                                const imageUrl = await uploadImage(file, "trips/activity");
                                updateStop("activity", stop.id, { imageUrl });
                              } catch {
                                setError("Could not upload activity image. Please try again.");
                              } finally {
                                setIsUploadingImage(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="rounded-full bg-amber-600 px-6 hover:bg-amber-700"
                onClick={() => void handleCreateTrip()}
                disabled={isSavingTrip}
              >
                {isSavingTrip ? "Posting..." : "Post Trip"}
              </Button>
            </div>
          </div>
        </section>

        <aside className="w-full lg:w-1/3 lg:self-start">
          <div className="rounded-3xl border border-stone-200/80 bg-white/90 p-4 shadow-xl shadow-stone-200/30 backdrop-blur-sm lg:sticky lg:top-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              Live Preview
            </p>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              <div
                className="relative h-56 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage || BANNER_PLACEHOLDER})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/80">{formatPreviewDate(date)}</p>
                  <h2 className="mt-1 text-2xl font-semibold leading-tight">{title || "Your trip title"}</h2>
                  <p className="mt-2 flex items-center gap-1 text-sm text-white/85">
                    <MapPin className="h-3.5 w-3.5" />
                    {tripLocation?.label || "Pick a primary location"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <p className="text-sm leading-relaxed text-stone-700">
                  {description || "Your trip story preview appears here as you write."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <span key={tag} className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-medium text-white">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-500">No tags yet.</span>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-stone-800">Stays ({lodgings.length})</p>
                    {lodgings.length > 0 ? (
                      <ul className="mt-1 space-y-1 text-stone-600">
                        {lodgings.map((stop) => (
                          <li key={stop.id}>{stop.title || "Untitled stay"}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-stone-500">No stays added.</p>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-stone-800">Activities ({activities.length})</p>
                    {activities.length > 0 ? (
                      <ul className="mt-1 space-y-1 text-stone-600">
                        {activities.map((stop) => (
                          <li key={stop.id}>{stop.title || "Untitled activity"}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-stone-500">No activities added.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
