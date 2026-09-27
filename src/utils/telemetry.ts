/**
 * Utilities for formatting geographic coordinates and azimuth bearings
 */

export function formatCoordinates(lat: number, lng: number): {
  latStr: string;
  lngStr: string;
  fullStr: string;
} {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const latStr = `${Math.abs(lat).toFixed(4)}° ${latDir}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  return {
    latStr,
    lngStr,
    fullStr: `${latStr}, ${lngStr}`,
  };
}

export function getCardinalDirection(bearing: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const normalized = ((bearing % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}
