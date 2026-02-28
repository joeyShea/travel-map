"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";

export interface PlaceOption {
  label: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface PlacePickerProps {
  label: string;
  placeholder?: string;
  value: PlaceOption | null;
  onChange: (value: PlaceOption | null) => void;
}

export default function PlacePicker({
  label,
  placeholder = "Search for a place",
  value,
  onChange,
}: PlacePickerProps) {
  const [query, setQuery] = useState(value?.label || "");
  const [results, setResults] = useState<PlaceOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value?.label]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/places?q=${encodeURIComponent(trimmed)}`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Could not search places");
        }

        setResults(Array.isArray(payload?.places) ? payload.places : []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const showSuggestions = useMemo(() => {
    return isOpen && (isLoading || results.length > 0 || query.trim().length >= 2);
  }, [isLoading, isOpen, query, results.length]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{label}</label>
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm">
          <MapPin className="h-4 w-4 text-amber-600" />
          <input
            value={query}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              if (value) {
                onChange(null);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-400 outline-none"
          />
          {value ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange(null);
              }}
              className="rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              aria-label="Clear selected place"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {showSuggestions ? (
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1 shadow-lg">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-stone-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching places...
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <button
                  key={`${result.label}-${result.latitude}-${result.longitude}`}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(result);
                    setQuery(result.label);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100"
                >
                  {result.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-stone-500">No places found.</p>
            )}
          </div>
        ) : null}
      </div>

      {value ? (
        <p className="text-xs text-stone-500">
          Selected: <span className="font-medium text-stone-700">{value.label}</span>
        </p>
      ) : null}
    </div>
  );
}
