/**
 * Geolocation & Spatial Distance Service
 */

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function calculateDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats distance into human-friendly string (e.g. "120m away" or "2.4 km away")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
}

/**
 * Formats visible map scope distance for dynamic radar pill (e.g. { value: 5, unit: 'km' })
 */
export function formatScopeDistance(meters: number): { value: number; unit: string; display: string } {
  if (meters < 1000) {
    const rounded = Math.max(100, Math.round(meters / 50) * 50);
    return { value: rounded, unit: 'm', display: `${rounded}m` };
  }
  if (meters < 10000) {
    const km = Number((meters / 1000).toFixed(1));
    return { value: km, unit: 'km', display: `${km}km` };
  }
  const km = Math.round(meters / 1000);
  return { value: km, unit: 'km', display: `${km}km` };
}
