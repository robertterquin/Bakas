# 01 — Product Principles

## 1. Product Vision
**Bakás** (*Tagalog for "traces", "tracks", or "footprints"*) is a lightweight, mobile-first Progressive Web App (PWA) designed to empower commuters, motorists, cyclists, and pedestrians in navigating and reporting urban road hazards in real-time. By leaving digital traces, citizens crowdsource live street awareness to protect each other from dangerous urban road traps.

> **Tagline:** *Leaving digital traces to navigate urban road hazards.*

---

## 2. Core Tenets & Operating Principles

### 1. Frictionless First (Zero-Login Barrier)
- **Immediate Utility:** Any user must be able to report a hazard within **5 seconds** without creating an account, entering an email, or authenticating.
- **Civic Openness:** Road safety information is a public utility. Reading the hazard map is 100% accessible to everyone immediately upon opening the app.
- **Browser-Native Geolocation:** Pinpointing defaults to high-accuracy device GPS with an instant manual map adjustment fallback.

### 2. Radical Reliability (Offline-First Architecture)
- **Cellular Dead Zone Tolerance:** Urban dead zones, underpasses, and weak data connections must never cause data loss.
- **IndexedDB Storage:** Submissions made while offline are saved locally in IndexedDB and automatically synchronized when network connectivity is restored.
- **Map Tile Caching:** Essential map viewports and UI assets are cached via Service Workers to remain readable in low-connectivity conditions.

### 3. Spatial Precision & Lean Data (5km Hyperlocal Focus)
- **Proximity Filtering:** Only hazards within a strict **5-kilometer radius** of the user's current location or active viewport are fetched and rendered.
- **Performance First:** Eliminates payload bloat and guarantees 60fps rendering even on low-end Android devices and budget mobile smartphones.

### 4. Self-Cleaning Ecosystem (Automated Data Decay)
- **Time-Decay by Category:** Road hazards are dynamic. Temporary obstacles (e.g., stalled vehicles, fallen branches) decay after **24 hours**; physical road defects (e.g., potholes, open manholes) decay after **7 days**.
- **Community Validation:** Community upvotes ("Still here" / "Cleared") dynamically extend or accelerate pin expiration, preventing stale "ghost pins".

### 5. High-Contrast "Command Center" Clarity
- **Glanceable UI:** Drivers, cyclists, and pedestrians need instant visual comprehension under bright sunlight or dark night driving.
- **Monochrome Slate & Radar Pulses:** A dark slate visual hierarchy (`#020617` canvas) with clean luminescent radar markers indicates severity without colorful clutter.

---

## 3. Target Audience & Context of Use

| User Persona | Context / Need | Key Interaction |
| :--- | :--- | :--- |
| **Motorcycle & Scooter Riders** | High vulnerability to potholes, manholes, and unlit streets | Quick glance at radar map before travel; rapid 1-tap hazard pinning |
| **Daily Commuters & Pedestrians** | Flood hazards, open manholes, unlit streets at night | View local 5km hazards on route; upvote/confirm reported hazards |
| **Cyclists & Micro-mobility** | Road obstructions, debris, damaged sewer grates | Offline recording of route obstacles in low-signal corridors |
| **Community Watch / Barangay Volunteers** | Verification of local infrastructure defects | Monitor decaying pins and flag resolved issues |

---

## 4. Product Boundaries (What Bakás Is and Is Not)

| Bakás Is | Bakás Is Not |
| :--- | :--- |
| A lightweight, anonymous road hazard radar | A heavy turn-by-turn navigation system (like Waze/Google Maps) |
| A community-driven early warning tool | An official government public works dispatch system |
| A privacy-respecting, zero-login civic platform | A social network with user profiles, direct messaging, or feeds |
| A high-speed offline-first reporting client | A bloated multimedia platform (no large video uploads) |
