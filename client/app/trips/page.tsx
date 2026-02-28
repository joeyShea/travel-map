"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const API_BASE_URL = "http://localhost:5001"
const TRIPS_STORAGE_KEY = "travel-map.trips"
const AVAILABLE_TAGS = [
  "beach",
  "city",
  "adventure",
  "budget-friendly",
  "luxury",
  "foodie",
  "nightlife",
  "nature",
  "cultural",
] as const

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("Unable to read selected image"))
    reader.readAsDataURL(file)
  })
}

type Lodging = {
  lodge_id: string
  trip_id: string
  address: string
  thumbnail_url: string
  title: string
  description: string
  latitude: string
  longitude: string
  cost: string
}

type Activity = {
  activity_id: string
  trip_id: string
  address: string
  thumbnail_url: string
  title: string
  location: string
  description: string
  latitude: string
  longitude: string
  cost: string
}

type Comment = {
  comment_id: string
  user_id: number | null
  trip_id: string
  body: string
  created_at: string
}

type DurationOption = "multiday trip" | "day trip" | "overnight trip"

type Trip = {
  trip_id: string
  thumbnail_url: string
  title: string
  description: string
  latitude: string
  longitude: string
  cost: string
  duration: DurationOption
  date: string
  visibility: "public" | "private" | "friends"
  owner_user_id: number | null
  tags: string[]
  lodgings: Lodging[]
  activities: Activity[]
  comments: Comment[]
}

type LodgingDraft = Omit<Lodging, "lodge_id" | "trip_id">
type ActivityDraft = Omit<Activity, "activity_id" | "trip_id">

const emptyLodgingDraft: LodgingDraft = {
  address: "",
  thumbnail_url: "",
  title: "",
  description: "",
  latitude: "",
  longitude: "",
  cost: "",
}

const emptyActivityDraft: ActivityDraft = {
  address: "",
  thumbnail_url: "",
  title: "",
  location: "",
  description: "",
  latitude: "",
  longitude: "",
  cost: "",
}

function isDurationOption(value: unknown): value is DurationOption {
  return value === "multiday trip" || value === "day trip" || value === "overnight trip"
}

function normalizeTrip(rawTrip: Partial<Trip>): Trip {
  return {
    trip_id: rawTrip.trip_id || crypto.randomUUID(),
    thumbnail_url: rawTrip.thumbnail_url || "",
    title: rawTrip.title || "",
    description: rawTrip.description || "",
    latitude: rawTrip.latitude || "",
    longitude: rawTrip.longitude || "",
    cost: rawTrip.cost || "",
    duration: isDurationOption(rawTrip.duration) ? rawTrip.duration : "multiday trip",
    date: rawTrip.date || "",
    visibility: rawTrip.visibility || "public",
    owner_user_id: typeof rawTrip.owner_user_id === "number" ? rawTrip.owner_user_id : null,
    tags: Array.isArray(rawTrip.tags) ? rawTrip.tags : [],
    lodgings: Array.isArray(rawTrip.lodgings) ? rawTrip.lodgings : [],
    activities: Array.isArray(rawTrip.activities) ? rawTrip.activities : [],
    comments: Array.isArray(rawTrip.comments) ? rawTrip.comments : [],
  }
}

export default function TripsPage() {
  const router = useRouter()

  const [ready, setReady] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [title, setTitle] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [description, setDescription] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [cost, setCost] = useState("")
  const [duration, setDuration] = useState<DurationOption>("multiday trip")
  const [date, setDate] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [lodgingDrafts, setLodgingDrafts] = useState<Record<string, LodgingDraft>>({})
  const [showLodgingFormByTrip, setShowLodgingFormByTrip] = useState<Record<string, boolean>>({})
  const [activityDrafts, setActivityDrafts] = useState<Record<string, ActivityDraft>>({})
  const [showActivityFormByTrip, setShowActivityFormByTrip] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          router.replace("/login")
          return
        }

        if (!isMounted) {
          return
        }

        const data = await response.json()
        const sessionUserId = typeof data?.user?.user_id === "number" ? data.user.user_id : null
        setCurrentUserId(sessionUserId)

        const rawTrips = window.localStorage.getItem(TRIPS_STORAGE_KEY)
        if (rawTrips) {
          const parsedTrips = JSON.parse(rawTrips) as Partial<Trip>[]
          setTrips(parsedTrips.map(normalizeTrip))
        }
        setReady(true)
      } catch {
        router.replace("/login")
      }
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  function persistTrips(nextTrips: Trip[]) {
    setTrips(nextTrips)
    window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(nextTrips))
  }

  function handleCreateTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    const createdTrip: Trip = {
      trip_id: crypto.randomUUID(),
      thumbnail_url: thumbnailUrl.trim(),
      title: title.trim(),
      description: description.trim(),
      latitude: latitude.trim(),
      longitude: longitude.trim(),
      cost: cost.trim(),
      duration,
      date: date.trim(),
      visibility,
      owner_user_id: currentUserId,
      tags: selectedTags,
      lodgings: [],
      activities: [],
      comments: [],
    }

    persistTrips([createdTrip, ...trips])
    setTitle("")
    setThumbnailUrl("")
    setDescription("")
    setLatitude("")
    setLongitude("")
    setCost("")
    setDuration("multiday trip")
    setDate("")
    setVisibility("public")
    setSelectedTags([])
  }

  function toggleTag(tag: string) {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag)
      }
      return [...current, tag]
    })
  }

  function addLodging(tripId: string) {
    const draft = lodgingDrafts[tripId] || emptyLodgingDraft
    if (!draft.title.trim()) {
      return
    }

    const nextTrips = trips.map((trip) => {
      if (trip.trip_id !== tripId) {
        return trip
      }

      return {
        ...trip,
        lodgings: [
          ...trip.lodgings,
          {
            lodge_id: crypto.randomUUID(),
            trip_id: trip.trip_id,
            address: draft.address.trim(),
            thumbnail_url: draft.thumbnail_url.trim(),
            title: draft.title.trim(),
            description: draft.description.trim(),
            latitude: draft.latitude.trim(),
            longitude: draft.longitude.trim(),
            cost: draft.cost.trim(),
          },
        ],
      }
    })

    persistTrips(nextTrips)
    setLodgingDrafts((current) => ({ ...current, [tripId]: { ...emptyLodgingDraft } }))
    setShowLodgingFormByTrip((current) => ({ ...current, [tripId]: false }))
  }

  function addActivity(tripId: string) {
    const draft = activityDrafts[tripId] || emptyActivityDraft
    if (!draft.title.trim()) {
      return
    }

    const nextTrips = trips.map((trip) => {
      if (trip.trip_id !== tripId) {
        return trip
      }

      return {
        ...trip,
        activities: [
          ...trip.activities,
          {
            activity_id: crypto.randomUUID(),
            trip_id: trip.trip_id,
            address: draft.address.trim(),
            thumbnail_url: draft.thumbnail_url.trim(),
            title: draft.title.trim(),
            location: draft.location.trim(),
            description: draft.description.trim(),
            latitude: draft.latitude.trim(),
            longitude: draft.longitude.trim(),
            cost: draft.cost.trim(),
          },
        ],
      }
    })

    persistTrips(nextTrips)
    setActivityDrafts((current) => ({ ...current, [tripId]: { ...emptyActivityDraft } }))
    setShowActivityFormByTrip((current) => ({ ...current, [tripId]: false }))
  }

  if (!ready) {
    return null
  }

  return (
    <main className="h-screen overflow-y-auto bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Add a trip</h1>
            <p className="text-sm text-muted-foreground">Create trips and add lodging + activities.</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Map</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create a Trip</CardTitle>
            <CardDescription>Fill in the core trip fields from your data structure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateTrip}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Summer in Italy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) {
                      setThumbnailUrl("")
                      return
                    }

                    const encoded = await fileToDataUrl(file)
                    setThumbnailUrl(encoded)
                  }}
                />
                {thumbnailUrl ? <p className="text-xs text-muted-foreground">Image selected</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tripDescription">Description</Label>
                <Textarea
                  id="tripDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What makes this trip special?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="41.9028" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="12.4964" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input id="cost" value={cost} onChange={(event) => setCost(event.target.value)} placeholder="1450.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <select
                  id="duration"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value as DurationOption)}
                >
                  <option value="multiday trip">multiday trip</option>
                  <option value="day trip">day trip</option>
                  <option value="overnight trip">overnight trip</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date (MM-YY)</Label>
                <Input id="date" value={date} onChange={(event) => setDate(event.target.value)} placeholder="06-26" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  id="visibility"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as "public" | "private" | "friends")}
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="friends">friends</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag)
                    return (
                      <Button
                        key={tag}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <Button type="submit">Create Trip</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {trips.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                No trips yet. Create your first trip above.
              </CardContent>
            </Card>
          ) : null}

          {trips.map((trip) => (
            <Card key={trip.trip_id}>
              <CardHeader>
                <CardTitle>{trip.title}</CardTitle>
                <CardDescription>
                  {trip.date || "No date"} • {trip.visibility}
                  {trip.duration ? ` • ${trip.duration}` : ""}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Trip ID: {trip.trip_id}</p>
                  <p>Owner User ID: {trip.owner_user_id ?? "unknown"}</p>
                  <p>Latitude: {trip.latitude || "-"}</p>
                  <p>Longitude: {trip.longitude || "-"}</p>
                  <p>Cost: {trip.cost || "-"}</p>
                  <p>Tags: {trip.tags.length ? trip.tags.join(", ") : "-"}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Lodging</h3>
                  {!showLodgingFormByTrip[trip.trip_id] ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLodgingFormByTrip((current) => ({ ...current, [trip.trip_id]: true }))}
                    >
                      + Add lodging
                    </Button>
                  ) : (
                    <div className="grid gap-2">
                      <Input
                        value={(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).title}
                        onChange={(event) =>
                          setLodgingDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: { ...(current[trip.trip_id] || emptyLodgingDraft), title: event.target.value },
                          }))
                        }
                        placeholder="Title"
                      />
                      <Input
                        value={(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).address}
                        onChange={(event) =>
                          setLodgingDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: { ...(current[trip.trip_id] || emptyLodgingDraft), address: event.target.value },
                          }))
                        }
                        placeholder="Address"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0]
                          const encoded = file ? await fileToDataUrl(file) : ""

                          setLodgingDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: {
                              ...(current[trip.trip_id] || emptyLodgingDraft),
                              thumbnail_url: encoded,
                            },
                          }))
                        }}
                      />
                      {(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).thumbnail_url ? (
                        <p className="text-xs text-muted-foreground">Image selected</p>
                      ) : null}
                      <Textarea
                        value={(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).description}
                        onChange={(event) =>
                          setLodgingDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: {
                              ...(current[trip.trip_id] || emptyLodgingDraft),
                              description: event.target.value,
                            },
                          }))
                        }
                        placeholder="Description"
                      />
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          value={(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).latitude}
                          onChange={(event) =>
                            setLodgingDrafts((current) => ({
                              ...current,
                              [trip.trip_id]: { ...(current[trip.trip_id] || emptyLodgingDraft), latitude: event.target.value },
                            }))
                          }
                          placeholder="Latitude"
                        />
                        <Input
                          value={(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).longitude}
                          onChange={(event) =>
                            setLodgingDrafts((current) => ({
                              ...current,
                              [trip.trip_id]: { ...(current[trip.trip_id] || emptyLodgingDraft), longitude: event.target.value },
                            }))
                          }
                          placeholder="Longitude"
                        />
                        <Input
                          value={(lodgingDrafts[trip.trip_id] || emptyLodgingDraft).cost}
                          onChange={(event) =>
                            setLodgingDrafts((current) => ({
                              ...current,
                              [trip.trip_id]: { ...(current[trip.trip_id] || emptyLodgingDraft), cost: event.target.value },
                            }))
                          }
                          placeholder="Cost"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => addLodging(trip.trip_id)}>
                          Save Lodging
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLodgingFormByTrip((current) => ({ ...current, [trip.trip_id]: false }))}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {trip.lodgings.map((lodging) => (
                      <li key={lodging.lodge_id}>• {lodging.title || "Untitled lodging"}</li>
                    ))}
                    {trip.lodgings.length === 0 ? <li>No lodging added yet.</li> : null}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Activities</h3>
                  {!showActivityFormByTrip[trip.trip_id] ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowActivityFormByTrip((current) => ({ ...current, [trip.trip_id]: true }))}
                    >
                      + Add activity
                    </Button>
                  ) : (
                    <div className="grid gap-2">
                      <Input
                        value={(activityDrafts[trip.trip_id] || emptyActivityDraft).title}
                        onChange={(event) =>
                          setActivityDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: { ...(current[trip.trip_id] || emptyActivityDraft), title: event.target.value },
                          }))
                        }
                        placeholder="Title"
                      />
                      <Input
                        value={(activityDrafts[trip.trip_id] || emptyActivityDraft).location}
                        onChange={(event) =>
                          setActivityDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: {
                              ...(current[trip.trip_id] || emptyActivityDraft),
                              location: event.target.value,
                            },
                          }))
                        }
                        placeholder="Location"
                      />
                      <Input
                        value={(activityDrafts[trip.trip_id] || emptyActivityDraft).address}
                        onChange={(event) =>
                          setActivityDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: { ...(current[trip.trip_id] || emptyActivityDraft), address: event.target.value },
                          }))
                        }
                        placeholder="Address"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0]
                          const encoded = file ? await fileToDataUrl(file) : ""

                          setActivityDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: {
                              ...(current[trip.trip_id] || emptyActivityDraft),
                              thumbnail_url: encoded,
                            },
                          }))
                        }}
                      />
                      {(activityDrafts[trip.trip_id] || emptyActivityDraft).thumbnail_url ? (
                        <p className="text-xs text-muted-foreground">Image selected</p>
                      ) : null}
                      <Textarea
                        value={(activityDrafts[trip.trip_id] || emptyActivityDraft).description}
                        onChange={(event) =>
                          setActivityDrafts((current) => ({
                            ...current,
                            [trip.trip_id]: {
                              ...(current[trip.trip_id] || emptyActivityDraft),
                              description: event.target.value,
                            },
                          }))
                        }
                        placeholder="Description"
                      />
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Input
                          value={(activityDrafts[trip.trip_id] || emptyActivityDraft).latitude}
                          onChange={(event) =>
                            setActivityDrafts((current) => ({
                              ...current,
                              [trip.trip_id]: { ...(current[trip.trip_id] || emptyActivityDraft), latitude: event.target.value },
                            }))
                          }
                          placeholder="Latitude"
                        />
                        <Input
                          value={(activityDrafts[trip.trip_id] || emptyActivityDraft).longitude}
                          onChange={(event) =>
                            setActivityDrafts((current) => ({
                              ...current,
                              [trip.trip_id]: { ...(current[trip.trip_id] || emptyActivityDraft), longitude: event.target.value },
                            }))
                          }
                          placeholder="Longitude"
                        />
                        <Input
                          value={(activityDrafts[trip.trip_id] || emptyActivityDraft).cost}
                          onChange={(event) =>
                            setActivityDrafts((current) => ({
                              ...current,
                              [trip.trip_id]: { ...(current[trip.trip_id] || emptyActivityDraft), cost: event.target.value },
                            }))
                          }
                          placeholder="Cost"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => addActivity(trip.trip_id)}>
                          Save Activity
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowActivityFormByTrip((current) => ({ ...current, [trip.trip_id]: false }))}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {trip.activities.map((activity) => (
                      <li key={activity.activity_id}>• {activity.title || "Untitled activity"}</li>
                    ))}
                    {trip.activities.length === 0 ? <li>No activities added yet.</li> : null}
                  </ul>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <h3 className="text-sm font-medium">Comments</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {trip.comments.map((comment) => (
                      <li key={comment.comment_id}>
                        • {comment.body} ({new Date(comment.created_at).toLocaleString()})
                      </li>
                    ))}
                    {trip.comments.length === 0 ? <li>No comments yet.</li> : null}
                  </ul>
                </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}