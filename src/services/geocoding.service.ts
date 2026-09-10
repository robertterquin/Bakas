export interface GeocodedLocation {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  type?: string;
}

const searchCache = new Map<string, GeocodedLocation[]>();

export const POPULAR_PHILIPPINE_LOCATIONS: GeocodedLocation[] = [
  {
    id: 'preset-edsa',
    name: 'EDSA (Epifanio de los Santos Ave)',
    subtitle: 'Metro Manila Arterial Highway',
    lat: 14.5869,
    lng: 121.0569,
  },
  {
    id: 'preset-commonwealth',
    name: 'Commonwealth Avenue',
    subtitle: 'Quezon City, Metro Manila',
    lat: 14.6789,
    lng: 121.0822,
  },
  {
    id: 'preset-c5',
    name: 'C-5 Circumferential Road',
    subtitle: 'Taguig / Pasig / Quezon City',
    lat: 14.5453,
    lng: 121.0558,
  },
  {
    id: 'preset-aguinaldo',
    name: 'Aguinaldo Highway',
    subtitle: 'Bacoor / Imus / Dasmariñas, Cavite',
    lat: 14.3986,
    lng: 120.9419,
  },
  {
    id: 'preset-espana',
    name: 'España Boulevard',
    subtitle: 'Sampaloc, City of Manila',
    lat: 14.6083,
    lng: 120.9936,
  },
  {
    id: 'preset-roxas',
    name: 'Roxas Boulevard',
    subtitle: 'Manila / Pasay / Parañaque Bayfront',
    lat: 14.5583,
    lng: 120.9856,
  },
  {
    id: 'preset-baguio',
    name: 'Session Road, Baguio City',
    subtitle: 'Benguet, Cordillera',
    lat: 16.4124,
    lng: 120.5977,
  },
  {
    id: 'preset-tagaytay',
    name: 'Tagaytay-Nasugbu Highway',
    subtitle: 'Tagaytay, Cavite',
    lat: 14.1153,
    lng: 120.9621,
  },
  {
    id: 'preset-cebu',
    name: 'Osmeña Boulevard, Cebu City',
    subtitle: 'Metro Cebu, Central Visayas',
    lat: 10.3157,
    lng: 123.8854,
  },
  {
    id: 'preset-davao',
    name: 'Roxas Avenue, Davao City',
    subtitle: 'Davao Region, Mindanao',
    lat: 7.0731,
    lng: 125.6128,
  },
  {
    id: 'preset-clark',
    name: 'Clark Freeport / Angeles City',
    subtitle: 'Pampanga, Central Luzon',
    lat: 15.1452,
    lng: 120.5887,
  },
  {
    id: 'preset-iloilo',
    name: 'Calle Real / Iloilo City Center',
    subtitle: 'Iloilo, Western Visayas',
    lat: 10.6969,
    lng: 122.5644,
  },
];

export async function searchPhilippineLocations(query: string): Promise<GeocodedLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  // 1. Direct coordinate input (e.g. "14.5995, 120.9842")
  const coordMatch = trimmed.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= 4 && lat <= 22 && lng >= 116 && lng <= 127) {
      return [
        {
          id: `coord-${lat}-${lng}`,
          name: `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          subtitle: 'Direct Geographic Coordinate Pin',
          lat,
          lng,
        },
      ];
    }
  }

  const cacheKey = trimmed.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  // 2. Check instant local presets match
  const localMatches = POPULAR_PHILIPPINE_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(cacheKey) || loc.subtitle.toLowerCase().includes(cacheKey)
  );

  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&countrycodes=ph&limit=6&addressdetails=1`;

    const res = await fetch(endpoint, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9,fil;q=0.8',
        'User-Agent': 'BakasCivicRadar/1.0',
      },
    });

    if (!res.ok) {
      if (localMatches.length > 0) return localMatches;
      throw new Error(`Geocoding HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) return localMatches;

    const results: GeocodedLocation[] = data.map((item: Record<string, unknown>, idx: number) => {
      const displayName = String(item.display_name || '');
      const parts = displayName.split(',').map((p) => p.trim());
      const name = parts[0] || String(item.name || 'Location');
      const subtitle = parts.slice(1, 4).join(', ') || 'Philippines';

      return {
        id: String(item.place_id || `geo-${idx}-${Date.now()}`),
        name,
        subtitle,
        lat: parseFloat(String(item.lat)),
        lng: parseFloat(String(item.lon)),
        type: String(item.type || 'place'),
      };
    });

    // Merge preset matches with remote results
    const combined = [...localMatches];
    const seen = new Set(combined.map((c) => `${c.lat.toFixed(3)},${c.lng.toFixed(3)}`));
    for (const r of results) {
      const key = `${r.lat.toFixed(3)},${r.lng.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(r);
      }
    }

    searchCache.set(cacheKey, combined);
    return combined;
  } catch (err) {
    console.warn('Geocoding search failed, returning local matches:', err);
    return localMatches;
  }
}
