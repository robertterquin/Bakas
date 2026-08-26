# 02 — Information Architecture

## 1. Structural Overview
Bakás is engineered as a single-page, map-centric command center. Navigation is minimal and direct, eliminating deep nested menus in favor of modal overlays, bottom sheets, and interactive map pins.

```
[ Root App Shell ]
  │
  ├── [ Live Radar Map Canvas ] (Full Viewport: Leaflet + CartoDB Dark Matter)
  │     ├── User Location Radar Pulse (GPS)
  │     ├── Dynamic 5km PostGIS Clustered Hazard Pins
  │     └── Quick Filter Control Bar (All, Pothole, Manhole, Drainage, Dark Street)
  │
  ├── [ HUD Top Navigation & Status Header ]
  │     ├── Brand Badge: "Bakás" & Live Status Indicator (Online / Offline Sync)
  │     ├── Proximity Radius Counter (e.g., "14 hazards within 5.0 km")
  │     └── Search / Center-on-Me Control
  │
  ├── [ Bottom Action HUD ]
  │     ├── Recenter GPS Button
  │     ├── Primary FAB: "Report Hazard" (Pin Trigger)
  │     └── Offline Pending Sync Indicator Counter
  │
  ├── [ Hazard Detail Modal / Bottom Sheet ]
  │     ├── Category Badge, Severity & Verification State
  │     ├── Distance from Current Position (e.g., "350m away")
  │     ├── Timestamp & Expiration TTL Countdown ("Expires in 18 hrs")
  │     ├── Community Validation Actions ("Still Here" Upvote / "Resolved" Flag)
  │     └── Share / Copy Coordinate Link
  │
  └── [ Fast Hazard Report Modal / Flow ]
        ├── Step 1: Category Selector (Pothole, Drainage, Obstruction, Dark Street)
        ├── Step 2: Severity Selector (Low, Medium, High / Danger)
        ├── Step 3: Location Pin Confirmation (Auto-GPS + Drag-to-Adjust)
        └── Step 4: Instant Submit (Local IndexedDB write + Background PostGIS Sync)
```

---

## 2. Data Hierarchy & Relationships

```
[ Spatial Viewport / GPS Center ]
      │ (queries 5km ST_DWithin)
      ▼
[ Hazard Records ]
      ├── id (UUID)
      ├── category ('pothole' | 'clogged_drainage' | 'road_obstruction' | 'dark_street')
      ├── severity ('low' | 'medium' | 'high')
      ├── location (PostGIS Point, 4326)
      ├── created_at (Timestamp with Timezone)
      ├── expires_at (Timestamp - auto-decay TTL)
      ├── upvotes (Integer - validation score)
      └── sync_status (Local IndexedDB only: 'synced' | 'pending_sync' | 'failed')
```

---

## 3. URL Routing Strategy
Because Bakás is a PWA designed for instant utility and low-latency interaction, client-side routing is lightweight:

| Route Path | View / State | Functionality |
| :--- | :--- | :--- |
| `/` | Live Radar Map | Default view showing map, GPS tracker, and hazards within 5km. |
| `/report` | New Hazard Flow | Opens the report bottom sheet/modal directly (ideal for PWA shortcut). |
| `/hazard/:id` | Hazard Detail View | Deep-links directly to a specific pinned hazard, centering the map. |
| `/offline` | Offline Fallback | Cached view when opening app without network and without cached map tiles. |

---

## 4. State Management Architecture

1. **Spatial State (`useLocationStore`):**
   - Current user lat/lng, accuracy radius, heading, and tracking status (Active / Paused / Denied).
2. **Hazard Query State (`useHazardStore`):**
   - Active 5km hazards cache, selected category filter, active pin detail, and upvote optimism.
3. **Offline & Sync State (`useSyncStore`):**
   - Network status (online/offline), IndexedDB queue count, sync-in-progress state, and tile caching cache-hit ratio.
4. **UI Modal State (`useUIStore`):**
   - Bottom sheet states (collapsed, half-expanded, full-expanded), filter drawer visibility, and toast notifications.
