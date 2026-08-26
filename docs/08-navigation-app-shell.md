# 08 — Navigation & App Shell

## 1. Shell Layout Blueprint

Bakás employs a non-traditional **HUD (Heads-Up Display) Shell** where the live interactive map occupies 100% of the viewport width and height (`100dvh`), with floating UI modules anchored to safe zones:

```
┌──────────────────────────────────────────────────────────┐
│ [Top Left]                [Top Center]       [Top Right] │
│  Bakás Brand Badge        Proximity Radius    Offline /  │
│  (Radar Status Dot)       "14 in 5.0 km"      Sync Pill  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                 [ INTERACTIVE RADAR MAP ]                 │
│                                                          │
│                • User Location (Pulsing)                 │
│                • 5km Hazard Pins                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [Bottom Bar Overlay]                                     │
│  [ Filter Chips: All | Pothole | Drainage | Dark Street] │
├──────────────────────────────────────────────────────────┤
│ [Bottom HUD Controls]                                    │
│                     [ + REPORT HAZARD ]    [ ⌖ Recenter] │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Shell Interaction Zones

### 1. Top HUD (Information Zone)
- **Brand & Status:** Tapping the brand mark opens the *About & Disclaimer* modal.
- **Sync Status Pill:** Displays `Online` (green dot) or `Offline (3 pending)` (amber dot). Tapping opens the *Sync Manager* modal.
- **Proximity Counter:** Displays live query metrics from PostGIS (`X hazards within 5km`).

### 2. Map Canvas (Direct Manipulation Zone)
- Gesture controls: 1-finger drag (pan), 2-finger pinch (zoom), double-tap (zoom in).
- Pin tap: Immediately locks map camera onto hazard and slides up the *Hazard Detail Bottom Sheet*.

### 3. Bottom HUD (Action Zone - Thumb Zone)
- Positioned inside the standard mobile ergonomic thumb zone.
- **Primary FAB ("Report Hazard"):** Elevated pill button (`h-14`, high-contrast dark slate surface with luminous border), triggers the *Report Hazard Flow*.
- **Recenter Button:** 48x48px circle with target icon; brings map center back to current device GPS coordinates with a smooth fly-to animation.

---

## 3. Safe Area Insets & PWA Standalone Mode
- The shell respects CSS environment variables `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to support notch devices (iPhone, modern Android devices) in both standalone PWA and browser modes.
- Disables pull-to-refresh on mobile browsers (`overscroll-behavior: none`) to prevent map panning from accidentally reloading the webpage.
