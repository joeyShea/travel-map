"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TravelReview, Activity } from "@/lib/travel-data";

interface MapViewProps {
    reviews: TravelReview[];
    selectedReview: TravelReview | null;
    fullScreenReview: TravelReview | null;
    selectedActivity: Activity | null;
    onSelectReview: (review: TravelReview | null) => void;
    onSelectActivity: (activity: Activity | null) => void;
}

export default function MapView({
    reviews,
    selectedReview,
    fullScreenReview,
    selectedActivity,
    onSelectReview,
    onSelectActivity,
}: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const activityMarkersRef = useRef<L.Marker[]>([]);

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

        // Fly to user's current location if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (cancelled) return;
                    map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, {
                        duration: 1.5,
                    });
                },
                () => {
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

    const createPhotoIcon = useCallback((review: TravelReview, isActive: boolean) => {
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
            src="${review.thumbnail}"
            alt="${review.title}"
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
          ">${review.title}</div>
        </div>
      `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    }, []);

    const createActivityIcon = useCallback((activity: Activity, isActive: boolean) => {
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

        if (fullScreenReview) return; // Hide review markers when full screen

        reviews.forEach((review) => {
            const isActive = selectedReview?.id === review.id;
            const icon = createPhotoIcon(review, isActive);
            const marker = L.marker([review.lat, review.lng], { icon })
                .addTo(map)
                .on("click", () => {
                    onSelectReview(review);
                });
            markersRef.current.push(marker);
        });
    }, [reviews, selectedReview, fullScreenReview, createPhotoIcon, onSelectReview]);

    // Create/update activity markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear existing activity markers
        activityMarkersRef.current.forEach((m) => m.remove());
        activityMarkersRef.current = [];

        if (!fullScreenReview) return;

        fullScreenReview.activities.forEach((activity) => {
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
    }, [fullScreenReview, selectedActivity, createActivityIcon, onSelectActivity]);

    // Fly to review area when entering full screen
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (fullScreenReview) {
            const bounds = L.latLngBounds(fullScreenReview.activities.map((a) => [a.lat, a.lng]));
            map.flyToBounds(bounds.pad(0.5), {
                duration: 1.5,
                maxZoom: 12,
            });
        } else if (!selectedReview) {
            map.flyTo([39.5, -98.35], 5, { duration: 1.5 });
        }
    }, [fullScreenReview, selectedReview]);

    // Fly to selected review in sidebar mode
    useEffect(() => {
        const map = mapRef.current;
        if (!map || fullScreenReview) return;

        if (selectedReview) {
            map.flyTo([selectedReview.lat, selectedReview.lng], 11, {
                duration: 1.2,
            });
        }
    }, [selectedReview, fullScreenReview]);

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
