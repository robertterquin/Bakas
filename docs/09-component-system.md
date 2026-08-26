# 09 — Component System

## 1. Core Component Catalog

Bakás utilizes an atomic, highly reusable component library built with React, TypeScript, and Tailwind CSS.

### 1. `MapRadarCanvas`
- Wraps Leaflet `<MapContainer>` and renders `<TileLayer>` pointing to CartoDB Dark Matter.
- Handles dynamic bounds change listeners and fires debounced PostGIS queries.
- Manages high-performance DOM marker rendering via custom Leaflet DivIcons.

### 2. `RadarHazardMarker`
- Custom SVG pin representing a hazard on the map.
- Props:
  ```typescript
  interface RadarHazardMarkerProps {
    id: string;
    category: 'pothole' | 'clogged_drainage' | 'road_obstruction' | 'dark_street';
    severity: 'low' | 'medium' | 'high';
    lat: number;
    lng: number;
    upvotes: number;
    isPendingSync?: boolean;
    onClick: () => void;
  }
  ```
- Renders severity-based pulsing animations and category glyphs.

### 3. `UserLocationDot`
- Pinpoints the user's live position with blue-slate radar ripples.
- Displays accuracy circle radius based on `geolocation.coords.accuracy`.

### 4. `BottomSheet` / `ModalOverlay`
- Accessible drawer component with drag handles, backdrop blur, swipe-down-to-close gestures, and focus trapping.
- Used for **Quick Report** and **Hazard Details**.

### 5. `CategorySelectorGrid`
- 2x2 grid of tactile selection cards:
  - Icon (Pothole, Drainage, Obstruction, Dark Street)
  - English Title & Tagalog Subtitle
  - Selected state with high-contrast slate-200 border and glow.

### 6. `SeveritySegmentedControl`
- 3-option toggle button: `Low` (Caution), `Medium` (Warning), `High` (Danger).
- Visual feedback updates marker preview immediately.

### 7. `ValidationActionBar`
- Interactive buttons on the detail sheet:
  - Upvote Button (`Still Here (+1)`) with optimistic animation.
  - Resolved Button (`Mark Cleared / Fixed`).
  - Share Button (`Copy Link`).

### 8. `SyncStatusBar` & `OfflineToast`
- Non-intrusive alert pill showing online/offline status, queue count, and automated retry status.
