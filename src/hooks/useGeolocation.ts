import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation } from '../types/hazard';
import { MANILA_DEFAULT_COORDS } from '../data/golden-fixtures';

export interface GeolocationState {
  location: UserLocation;
  isTracking: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unavailable';
  errorMessage: string | null;
  recenterCount: number;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: {
      lat: MANILA_DEFAULT_COORDS.lat,
      lng: MANILA_DEFAULT_COORDS.lng,
      accuracy: 25,
      heading: null,
      speed: null,
      timestamp: Date.now(),
    },
    isTracking: false,
    permissionState: 'prompt',
    errorMessage: null,
    recenterCount: 0,
  });

  const watchIdRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        permissionState: 'unavailable',
        errorMessage: 'Geolocation is not supported on this device.',
      }));
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy || 15,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          },
          isTracking: true,
          permissionState: 'granted',
          errorMessage: null,
        }));
      },
      (error) => {
        let msg = 'Failed to acquire location.';
        let perm: GeolocationState['permissionState'] = 'denied';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Showing Manila city center.';
          perm = 'denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Using last known location.';
          perm = 'prompt';
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS location request timed out.';
          perm = 'prompt';
        }

        setState((prev) => ({
          ...prev,
          isTracking: false,
          permissionState: perm,
          errorMessage: msg,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  const recenter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      recenterCount: prev.recenterCount + 1,
    }));
    startWatching();
  }, [startWatching]);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setState((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        lat,
        lng,
        accuracy: 10,
        timestamp: Date.now(),
      },
      recenterCount: prev.recenterCount + 1,
    }));
  }, []);

  useEffect(() => {
    startWatching();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatching]);

  return {
    ...state,
    recenter,
    setManualLocation,
  };
}
