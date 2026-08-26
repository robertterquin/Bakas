# 04 — Screen Inventory & Viewport States

## 1. Primary Screens & Surface Matrix

| Screen / Modal | Viewport Target | Key Elements | Core User Action |
| :--- | :--- | :--- | :--- |
| **SCR-01: Live Radar View (Home)** | Mobile viewport (360px–430px) & Desktop (responsive) | Full-screen Leaflet dark map, GPS pulsing dot, Top Status Bar, Filter Chips, Recenter Button, Report FAB | Pan, zoom, inspect pins, trigger reporting |
| **SCR-02: Quick Report Sheet** | Bottom sheet (modal slide-up) | 4 Category cards, 3 Severity selectors, Mini GPS confirmation map, "Submit Trace" button | Select category & severity, submit report |
| **SCR-03: Hazard Detail Sheet** | Bottom sheet (modal slide-up) | Category icon & label, severity badge, distance calculation, age & expiration countdown, "Still Here" & "Cleared" buttons, Share button | Inspect hazard, validate status, share link |
| **SCR-04: Filter & Radius Drawer** | Side/top dropdown panel | Radius selector (1km, 3km, 5km), Category toggles, Severity filter, Clear all filters | Customize visible map radar pins |
| **SCR-05: Offline Sync Status Modal** | Centered modal / HUD banner | Pending sync items list, retry button, storage clearance, offline tile status | Inspect offline queue, force manual sync |
| **SCR-06: About & Safety Guidance** | Full overlay / modal | Product principles, anonymous privacy disclosure, disclaimer ("Not a replacement for alert driving") | Learn about Bakás, review data policies |

---

## 2. Core UI Component Breakdown per Screen

### SCR-01: Live Radar Canvas
- **`MapContainer`**: Leaflet viewport styled with CartoDB Dark Matter tiles.
- **`UserLocationMarker`**: Glowing blue-slate circle with animated concentric radar ripples.
- **`HazardMarkerCluster`**: Dynamic SVG radar markers rendered by severity opacity.
- **`TopStatusBar`**: Displays brand mark `Bakás`, active hazard counter (`12 hazards in 5km`), and network sync pill.
- **`CategoryFilterBar`**: Horizontal scrollable pill buttons: `[ All ] [ ⚠️ Potholes ] [ 🕳️ Manholes ] [ 💧 Drainage ] [ 🌑 Dark Streets ]`.
- **`ActionHUD`**:
  - Floating `Recenter GPS` button (bottom right).
  - Floating `Report Hazard` button (bottom center, elevated high-contrast slate-900 with white glow).

### SCR-02: Quick Report Sheet
- **Category Grid (2x2)**:
  - `Pothole` (Butas / Lubak)
  - `Clogged Drainage` (Baradong Kanal / Baha)
  - `Road Obstruction` (Harang sa Daan)
  - `Dark Street` (Madilim na Kalsada)
- **Severity Segmented Control**:
  - `Low` (Caution / Minor inconvenience)
  - `Medium` (Vehicle slowdown / Pedestrian hazard)
  - `High` (Critical danger / High collision or crash risk)
- **GPS Coordinates Preview**: Auto-populated latitude & longitude with mini draggable pin adjustment toggle.
- **Submit CTA**: "Drop Hazard Trace" (Full width, instant feedback).

### SCR-03: Hazard Detail Sheet
- **Header**: Category Title with High-Contrast Severity Badge.
- **Metrics Bar**: Distance (`420m away`) | Reported (`3h ago`) | TTL (`Expires in 6d`).
- **Validation Actions**:
  - Primary: `Still Here (+1)` button with live counter.
  - Secondary: `Report Cleared / Resolved` button.
- **Coordinate Info**: Read-only lat/long with 1-tap "Copy Link / Coordinates".
