"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapActivity, MapTrip } from "@/lib/trip-models";

interface MapViewProps {
    trips: MapTrip[];
    selectedTrip: MapTrip | null;
    fullScreenTrip: MapTrip | null;
    selectedActivity: MapActivity | null;
    onSelectTripById: (tripId: number | null) => void;
    onSelectActivity: (activity: MapActivity | null) => void;
}

const SELECTED_REVIEW_ZOOM = 16;
let hasAutoCenteredOnUser = false;

function getLocationKey(lat: number, lng: number): string {
    return `${lat.toFixed(6)}:${lng.toFixed(6)}`;
}

function getTripTimestamp(dateValue: string): number {
    const timestamp = Date.parse(dateValue);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getMostRecentTripsByLocation(trips: MapTrip[]): MapTrip[] {
    const mostRecentByLocation = new Map<string, MapTrip>();

    trips.forEach((trip) => {
        const key = getLocationKey(trip.lat, trip.lng);
        const currentMostRecent = mostRecentByLocation.get(key);

        if (!currentMostRecent || getTripTimestamp(trip.date) > getTripTimestamp(currentMostRecent.date)) {
            mostRecentByLocation.set(key, trip);
        }
    });

    return Array.from(mostRecentByLocation.values());
}

export default function MapView({
    trips,
    selectedTrip,
    fullScreenTrip,
    selectedActivity,
    onSelectTripById,
    onSelectActivity,
}: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const activityMarkersRef = useRef<L.Marker[]>([]);
    const lastFocusedLocationKeyRef = useRef<string | null>(null);
    const selectedTripRef = useRef<MapTrip | null>(null);
    const fullScreenTripRef = useRef<MapTrip | null>(null);
    const selectedActivityRef = useRef<MapActivity | null>(null);

    useEffect(() => {
        selectedTripRef.current = selectedTrip;
    }, [selectedTrip]);

    useEffect(() => {
        fullScreenTripRef.current = fullScreenTrip;
    }, [fullScreenTrip]);

    useEffect(() => {
        selectedActivityRef.current = selectedActivity;
    }, [selectedActivity]);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Extended bounds to cover continental US + Alaska + Hawaii, with padding
        const usBounds = L.latLngBounds([13, -180], [76, -60]);

        const map = L.map(mapContainerRef.current, {
            center: [39.5, -98.35],
            zoom: 5,
            minZoom: 4,
            maxBounds: usBounds,
            maxBoundsViscosity: 1.0,
            zoomControl: false,
            attributionControl: false,
        });

        L.tileLayer("https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token={accessToken}", {
            maxZoom: 22,
            minZoom: 4,
            accessToken: process.env.NEXT_PUBLIC_JAWG_API_KEY ?? "",
        } as L.TileLayerOptions & { accessToken: string }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapRef.current = map;

        let cancelled = false;

        // Fly to user's current location if available (at most once per app session).
        if (!hasAutoCenteredOnUser && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (cancelled || hasAutoCenteredOnUser) return;

                    if (
                        selectedTripRef.current !== null ||
                        fullScreenTripRef.current !== null ||
                        selectedActivityRef.current !== null
                    ) {
                        hasAutoCenteredOnUser = true;
                        return;
                    }

                    hasAutoCenteredOnUser = true;
                    map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, {
                        duration: 1.5,
                    });
                },
                () => {
                    hasAutoCenteredOnUser = true;
                    // Permission denied or unavailable — stay on US default
                },
            );
        }

        return () => {
            cancelled = true;
            map.remove();
            mapRef.current = null;
        };
    }, []);

    const createPhotoIcon = useCallback((trip: MapTrip, isActive: boolean) => {
        const size = isActive ? 80 : 64;
        return L.divIcon({
            className: "photo-marker",
            html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 12px;
          overflow: hidden;
          border: ${isActive ? "3px solid #d4a055" : "2px solid rgba(255,255,255,0.3)"};
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        ">
          <img
            src="${trip.thumbnail}"
            alt="${trip.title}"
            style="width:100%;height:100%;object-fit:cover;"
            crossorigin="anonymous"
          />
          <div style="
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 4px 6px;
            background: linear-gradient(transparent, rgba(0,0,0,0.85));
            color: white;
            font-size: 10px;
            font-weight: 600;
            font-family: system-ui, sans-serif;
            letter-spacing: 0.02em;
          ">${trip.title}</div>
        </div>
      `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    }, []);

    const createActivityIcon = useCallback((activity: MapActivity, isActive: boolean) => {
        const size = isActive ? 60 : 48;
        return L.divIcon({
            className: "activity-marker",
            html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          overflow: hidden;
          border: ${isActive ? "3px solid #d4a055" : "2px solid rgba(255,255,255,0.5)"};
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          <img
            src="${activity.image}"
            alt="${activity.title}"
            style="width:100%;height:100%;object-fit:cover;"
            crossorigin="anonymous"
          />
        </div>
      `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    }, []);

    // Create/update review markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const mostRecentTrips = getMostRecentTripsByLocation(trips);

        if (fullScreenTrip) {
            const fullScreenLocationKey = getLocationKey(fullScreenTrip.lat, fullScreenTrip.lng);
            const locationRepresentative =
                mostRecentTrips.find((trip) => getLocationKey(trip.lat, trip.lng) === fullScreenLocationKey) ??
                fullScreenTrip;

            const icon = createPhotoIcon(locationRepresentative, true);
            const marker = L.marker([locationRepresentative.lat, locationRepresentative.lng], { icon }).addTo(map);
            markersRef.current.push(marker);
            return;
        }

        const selectedLocationKey = selectedTrip ? getLocationKey(selectedTrip.lat, selectedTrip.lng) : null;

        mostRecentTrips.forEach((trip) => {
            const tripLocationKey = getLocationKey(trip.lat, trip.lng);
            const isActive = selectedLocationKey !== null && selectedLocationKey === tripLocationKey;
            const icon = createPhotoIcon(trip, isActive);
            const marker = L.marker([trip.lat, trip.lng], { icon })
                .addTo(map)
                .on("click", () => {
                    onSelectTripById(trip.id);
                });
            markersRef.current.push(marker);
        });
    }, [trips, selectedTrip, fullScreenTrip, createPhotoIcon, onSelectTripById]);

    // Create/update activity markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing activity markers
        activityMarkersRef.current.forEach((m) => m.remove());
        activityMarkersRef.current = [];

        if (!fullScreenTrip) return;

        fullScreenTrip.activities.forEach((activity) => {
            const isActive = selectedActivity?.id === activity.id;
            const icon = createActivityIcon(activity, isActive);
            const marker = L.marker([activity.lat, activity.lng], { icon })
                .addTo(map)
                .on("click", () => {
                    onSelectActivity(activity);
                    map.flyTo([activity.lat, activity.lng], 13, {
                        duration: 1,
                    });
                });
            activityMarkersRef.current.push(marker);
        });
    }, [fullScreenTrip, selectedActivity, createActivityIcon, onSelectActivity]);

    // Fly to selected review in sidebar mode
    useEffect(() => {
        const map = mapRef.current;
        if (!map || fullScreenTrip) return;

        if (selectedTrip) {
            const selectedLocationKey = getLocationKey(selectedTrip.lat, selectedTrip.lng);
            if (lastFocusedLocationKeyRef.current === selectedLocationKey) {
                return;
            }

            lastFocusedLocationKeyRef.current = selectedLocationKey;
            map.flyTo([selectedTrip.lat, selectedTrip.lng], SELECTED_REVIEW_ZOOM, {
                duration: 1.2,
            });
            return;
        }

        lastFocusedLocationKeyRef.current = null;
    }, [selectedTrip, fullScreenTrip]);

    // Invalidate map size when container resizes (sidebar open/close)
    useEffect(() => {
        const map = mapRef.current;
        const container = mapContainerRef.current;
        if (!map || !container) return;

        const observer = new ResizeObserver(() => {
            map.invalidateSize({ animate: true });
        });
        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    return <div ref={mapContainerRef} className="h-full w-full" />;
}
