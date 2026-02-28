import { NextResponse } from "next/server";

interface NominatimResult {
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "6",
      addressdetails: "1",
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "User-Agent": "travel-map/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Place search failed");
    }

    const raw = (await response.json()) as NominatimResult[];

    const places = raw
      .map((item) => {
        const label = typeof item.display_name === "string" ? item.display_name : null;
        const lat = typeof item.lat === "string" ? Number(item.lat) : null;
        const lon = typeof item.lon === "string" ? Number(item.lon) : null;

        if (!label || Number.isNaN(lat) || Number.isNaN(lon) || lat === null || lon === null) {
          return null;
        }

        return {
          label,
          latitude: lat,
          longitude: lon,
          address: label,
        };
      })
      .filter((place): place is { label: string; latitude: number; longitude: number; address: string } => Boolean(place));

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ error: "Could not load places right now." }, { status: 502 });
  }
}
