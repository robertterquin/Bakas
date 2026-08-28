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
];

export async function searchPhilippineLocations(query: string): Promise<GeocodedLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  // Check direct coordinate input (e.g. "14.5995, 120.9842")
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
      throw new Error(`Geocoding HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

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

    searchCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}
