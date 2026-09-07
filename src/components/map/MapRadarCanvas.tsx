import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hazard, UserLocation, CategoryFilter, RadiusFilter } from '../../types/hazard';
import { calculateDistanceInMeters } from '../../services/geo.service';
import { getCategorySvgMarkup } from '../ui/HazardIcon';
import { hasDeviceVoted } from '../../utils/domain-rules';

interface MapRadarCanvasProps {
  userLocation: UserLocation;
  hazards: Hazard[];
  selectedHazardId: string | null;
  onSelectHazard: (id: string) => void;
  recenterCount: number;
  radiusFilter: RadiusFilter;
  activeFilter: CategoryFilter;
  tempPinLocation?: { lat: number; lng: number } | null;
  searchTarget?: { lat: number; lng: number; count: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onViewportScopeChange?: (visibleRadiusMeters: number) => void;
}

export const MapRadarCanvas: React.FC<MapRadarCanvasProps> = ({
  userLocation,
  hazards,
  selectedHazardId,
  onSelectHazard,
  recenterCount,
  radiusFilter,
  tempPinLocation,
  searchTarget,
  onMapClick,
  onViewportScopeChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const searchPulseMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const radiusBoundaryCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map with High-Performance Tile Caching
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
      preferCanvas: true,
    });

    // 100% Zero-Key, Zero-Watermark Pure Monochrome Radar Canvas (High-Speed Caching)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri &mdash; OpenStreetMap contributors',
        maxZoom: 16,
        minZoom: 3,
        keepBuffer: 6,
        updateWhenIdle: true,
        updateWhenZooming: false,
      }
    ).addTo(map);

    // Clean reference road and locality labels
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '',
        maxZoom: 16,
        minZoom: 3,
        keepBuffer: 6,
        updateWhenIdle: true,
        updateWhenZooming: false,
      }
    ).addTo(map);

    // Zoom controls positioned at top right (safe from thumb HUD)
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Real-time Viewport Ground Scope Calculation as user zooms & moves
    const computeViewportScope = () => {
      if (!onViewportScopeChange) return;
      const bounds = map.getBounds();
      const center = map.getCenter();
      const eastEdge = L.latLng(center.lat, bounds.getEast());
      const radiusMeters = center.distanceTo(eastEdge);
      onViewportScopeChange(Math.round(radiusMeters));
    };

    map.on('zoom move zoomend moveend', computeViewportScope);

    // Handle map clicks to drop pin anywhere
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Trigger invalidateSize to ensure full viewport tile loading
    const timer = setTimeout(() => {
      map.invalidateSize();
      computeViewportScope();
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
      computeViewportScope();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recenter on GPS when triggered
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 0.6,
      });
    }
  }, [recenterCount, userLocation.lat, userLocation.lng]);

  // Instant Teleport / Adaptive Camera Move on Location Search (Zero Tile Churn)
  useEffect(() => {
    if (!searchTarget || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const currentCenter = map.getCenter();
    const distMeters = calculateDistanceInMeters(
      currentCenter.lat,
      currentCenter.lng,
      searchTarget.lat,
      searchTarget.lng
    );

    // For distant searches (> 2.5km), jump directly to avoid downloading dozens of flight tiles
    if (distMeters > 2500) {
      map.setView([searchTarget.lat, searchTarget.lng], 16, { animate: false });
    } else {
      map.flyTo([searchTarget.lat, searchTarget.lng], 16, { animate: true, duration: 0.5 });
    }

    // Add a temporary 2.5s visual radar beacon on the searched target
    const pulseIcon = L.divIcon({
      className: 'custom-search-pulse',
      html: `
        <div class="relative flex items-center justify-center w-12 h-12">
          <div class="absolute w-12 h-12 rounded-full border-2 border-white animate-ping opacity-90"></div>
          <div class="absolute w-8 h-8 rounded-full bg-white/20 border border-white animate-pulse"></div>
          <div class="w-3 h-3 rounded-full bg-white shadow-[0_0_16px_#ffffff]"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

    if (searchPulseMarkerRef.current) {
      map.removeLayer(searchPulseMarkerRef.current);
    }
    const pulseMarker = L.marker([searchTarget.lat, searchTarget.lng], {
      icon: pulseIcon,
      zIndexOffset: 1500,
    }).addTo(map);
    searchPulseMarkerRef.current = pulseMarker;

    const removeTimer = setTimeout(() => {
      if (searchPulseMarkerRef.current) {
        map.removeLayer(searchPulseMarkerRef.current);
        searchPulseMarkerRef.current = null;
      }
    }, 2800);

    return () => clearTimeout(removeTimer);
  }, [searchTarget]);

  // Update user GPS location marker & accuracy circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userLatLng: L.LatLngExpression = [userLocation.lat, userLocation.lng];

    // User GPS pulsing dot icon - Pure Monochrome Stark White Radar
    const userIcon = L.divIcon({
      className: 'custom-user-dot',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-white/20 animate-ping"></div>
          <div class="absolute w-6 h-6 rounded-full bg-white/30 border border-white/50 animate-pulse"></div>
          <div class="relative w-4 h-4 rounded-full bg-white border-2 border-black shadow-[0_0_14px_#ffffff]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(userLatLng);
    }

    // Accuracy Circle
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle(userLatLng, {
        radius: Math.min(userLocation.accuracy, 200),
        color: '#ffffff',
        weight: 1,
        opacity: 0.2,
        fillColor: '#ffffff',
        fillOpacity: 0.03,
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng(userLatLng);
      accuracyCircleRef.current.setRadius(Math.min(userLocation.accuracy, 200));
    }

    // Radius Boundary (Only rendered if specific locked radius filter is set > 0)
    if (radiusFilter > 0) {
      if (!radiusBoundaryCircleRef.current) {
        radiusBoundaryCircleRef.current = L.circle(userLatLng, {
          radius: radiusFilter,
          color: '#52525b',
          weight: 1,
          dashArray: '4, 8',
          opacity: 0.35,
          fillColor: '#09090b',
          fillOpacity: 0.02,
        }).addTo(map);
      } else {
        radiusBoundaryCircleRef.current.setLatLng(userLatLng);
        radiusBoundaryCircleRef.current.setRadius(radiusFilter);
      }
    } else if (radiusBoundaryCircleRef.current) {
      map.removeLayer(radiusBoundaryCircleRef.current);
      radiusBoundaryCircleRef.current = null;
    }
  }, [userLocation, radiusFilter]);

  // Render Temporary Clicked Pin Target
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempPinLocation) {
      const targetIcon = L.divIcon({
        className: 'custom-temp-target',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10 animate-bounce">
            <div class="absolute -inset-2 rounded-full border-2 border-white/80 animate-ping opacity-75"></div>
            <div class="w-8 h-8 rounded-full bg-white text-black border-2 border-zinc-900 flex items-center justify-center font-bold text-sm shadow-[0_0_20px_#ffffff]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36],
      });

      if (!tempMarkerRef.current) {
        tempMarkerRef.current = L.marker([tempPinLocation.lat, tempPinLocation.lng], {
          icon: targetIcon,
          zIndexOffset: 1200,
        }).addTo(map);
      } else {
        tempMarkerRef.current.setLatLng([tempPinLocation.lat, tempPinLocation.lng]);
      }
    } else if (tempMarkerRef.current) {
      map.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  }, [tempPinLocation]);

  // Update Hazard Markers on map with pure monochrome vector icons
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    hazards.forEach((hazard) => {
      const isSelected = hazard.id === selectedHazardId;
      const isHigh = hazard.severity === 'high';
      const isMedium = hazard.severity === 'medium';
      const isPending = hazard.syncStatus === 'pending_sync';
      const isResolved = Boolean(
        hazard.isResolved ||
        (hazard.resolvedCount && hazard.resolvedCount > 0) ||
        hasDeviceVoted(hazard.id, 'resolve')
      );

      // Pure monochrome tactical marker styling
      let outerRing = '';
      let resolvedBadge = '';
      let markerColor = 'bg-black border-zinc-700 text-zinc-400';
      let iconColor = '#a1a1aa';

      if (isResolved) {
        markerColor = 'bg-zinc-950/80 border-dashed border-zinc-700 text-zinc-500 opacity-45';
        iconColor = '#71717a';
        outerRing = '';
        resolvedBadge = `
          <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_10px_#ffffff] border border-black z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        `;
      } else if (isHigh) {
        markerColor = 'bg-black border-white text-white shadow-[0_0_18px_rgba(255,255,255,0.95)]';
        iconColor = '#ffffff';
        outerRing = '<div class="absolute -inset-1.5 rounded-full border border-white/60 animate-ping opacity-75 pointer-events-none"></div>';
      } else if (isMedium) {
        markerColor = 'bg-black border-zinc-400 text-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.35)]';
        iconColor = '#f4f4f5';
      }

      if (isPending && !isResolved) {
        markerColor += ' border-dashed border-zinc-300 shadow-[0_0_12px_rgba(255,255,255,0.5)]';
        iconColor = '#ffffff';
      }

      // Accurate vector SVG icon matching top navigation
      const svgIconMarkup = getCategorySvgMarkup(hazard.category, iconColor);

      const selectedClass = isSelected
        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-125 z-50'
        : 'hover:scale-110 transition-transform';

      const customDiv = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer ${selectedClass}">
            ${outerRing}
            ${resolvedBadge}
            <div class="w-9 h-9 rounded-full ${markerColor} border-2 flex items-center justify-center select-none transition-all">
              ${svgIconMarkup}
            </div>
            ${
              hazard.upvotes > 1 && !isResolved
                ? `<div class="absolute -bottom-1 -right-1 bg-black border border-zinc-700 text-[10px] font-mono text-white px-1 rounded-full leading-tight font-bold">
                    +${hazard.upvotes}
                  </div>`
                : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([hazard.lat, hazard.lng], { icon: customDiv });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectHazard(hazard.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([hazard.lat, hazard.lng], { animate: true, duration: 0.4 });
        }
      });

      markersLayer.addLayer(marker);
    });
  }, [hazards, selectedHazardId, onSelectHazard]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
