import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hazard, UserLocation, CategoryFilter, RadiusFilter } from '../../types/hazard';

interface MapRadarCanvasProps {
  userLocation: UserLocation;
  hazards: Hazard[];
  selectedHazardId: string | null;
  onSelectHazard: (id: string) => void;
  recenterCount: number;
  radiusFilter: RadiusFilter;
  activeFilter: CategoryFilter;
  tempPinLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export const MapRadarCanvas: React.FC<MapRadarCanvasProps> = ({
  userLocation,
  hazards,
  selectedHazardId,
  onSelectHazard,
  recenterCount,
  radiusFilter,
  tempPinLocation,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const radiusBoundaryCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    // Add CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 4,
    }).addTo(map);

    // Zoom controls positioned at top right (safe from thumb HUD)
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Handle map clicks to drop pin anywhere
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Trigger invalidateSize to ensure full viewport tile loading
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recenter when triggered
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [recenterCount, userLocation.lat, userLocation.lng]);

  // Update user GPS location marker & accuracy circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userLatLng: L.LatLngExpression = [userLocation.lat, userLocation.lng];

    // User GPS pulsing dot icon
    const userIcon = L.divIcon({
      className: 'custom-user-dot',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-sky-400/20 animate-ping"></div>
          <div class="absolute w-6 h-6 rounded-full bg-sky-500/30 border border-sky-400/50 animate-pulse"></div>
          <div class="relative w-4 h-4 rounded-full bg-sky-400 border-2 border-white shadow-[0_0_12px_#38bdf8]"></div>
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
        color: '#38bdf8',
        weight: 1,
        opacity: 0.3,
        fillColor: '#38bdf8',
        fillOpacity: 0.05,
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng(userLatLng);
      accuracyCircleRef.current.setRadius(Math.min(userLocation.accuracy, 200));
    }

    // Radius Boundary (5km / 3km / 1km radar range)
    if (!radiusBoundaryCircleRef.current) {
      radiusBoundaryCircleRef.current = L.circle(userLatLng, {
        radius: radiusFilter,
        color: '#64748b',
        weight: 1,
        dashArray: '4, 8',
        opacity: 0.25,
        fillColor: '#0f172a',
        fillOpacity: 0.02,
      }).addTo(map);
    } else {
      radiusBoundaryCircleRef.current.setLatLng(userLatLng);
      radiusBoundaryCircleRef.current.setRadius(radiusFilter);
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
            <div class="w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-sky-400 flex items-center justify-center font-bold text-sm shadow-[0_0_20px_#ffffff]">
              📍
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

  // Update Hazard Markers on map
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    hazards.forEach((hazard) => {
      const isSelected = hazard.id === selectedHazardId;
      const isHigh = hazard.severity === 'high';
      const isMedium = hazard.severity === 'medium';
      const isPending = hazard.syncStatus === 'pending_sync';
      const isResolved = hazard.isResolved;

      // Category Icon Symbol
      let symbol = '⚠️';
      if (hazard.category === 'clogged_drainage') symbol = '💧';
      if (hazard.category === 'road_obstruction') symbol = '🚧';
      if (hazard.category === 'dark_street') symbol = '🌑';
      if (hazard.category === 'pothole') symbol = '🕳️';

      // Pin styling based on tactical visual rules
      let outerRing = '';
      let markerColor = 'bg-slate-500 border-slate-400 text-slate-200';

      if (isHigh) {
        markerColor = 'bg-slate-900 border-white text-white shadow-[0_0_16px_rgba(255,255,255,0.9)]';
        outerRing = '<div class="absolute -inset-1.5 rounded-full border border-white/60 animate-ping opacity-75 pointer-events-none"></div>';
      } else if (isMedium) {
        markerColor = 'bg-slate-800 border-slate-300 text-slate-100 shadow-[0_0_10px_rgba(203,213,225,0.6)]';
      }

      if (isPending) {
        markerColor += ' border-dashed border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]';
      }

      if (isResolved) {
        markerColor = 'bg-slate-900/60 border-slate-700 text-slate-500 opacity-40';
        outerRing = '';
      }

      const selectedClass = isSelected
        ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-125 z-50'
        : 'hover:scale-110 transition-transform';

      const customDiv = L.divIcon({
        className: 'custom-hazard-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer ${selectedClass}">
            ${outerRing}
            <div class="w-9 h-9 rounded-full ${markerColor} border-2 flex items-center justify-center text-sm font-bold select-none transition-all">
              <span>${symbol}</span>
            </div>
            ${
              hazard.upvotes > 1
                ? `<div class="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-700 text-[10px] font-mono text-slate-200 px-1 rounded-full leading-tight font-bold">
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
