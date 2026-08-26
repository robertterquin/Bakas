# Bakás (Urban Road Hazard Radar)

> *Leaving digital traces to navigate urban road hazards.*

**Bakás** (*Tagalog for "traces", "tracks", or "footprints"*) is a lightweight, mobile-first Progressive Web App (PWA) designed to empower commuters, motorists, cyclists, and pedestrians in navigating and reporting urban road hazards in real-time. By leaving digital traces, citizens crowdsource live street awareness to protect each other from dangerous potholes, open manholes, flash floods, clogged drainages, and unlit streets with zero login barrier, resilient offline-first synchronization, and 5km PostGIS spatial filtering.

---

## ⚡ Core Operating Tenets

1. **Zero-Login Barrier (Frictionless First):** 1-tap hazard reporting in under 5 seconds with zero account creation, passwords, or emails.
2. **Radical Offline Resilience:** Full support for cellular dead zones (tunnels, underpasses) using IndexedDB (`idb`) with automated background sync upon reconnection.
3. **Spatial Precision (5km PostGIS Radar):** Strict 5-kilometer radius spatial filtering (`ST_DWithin`) ensures instant viewport loading and prevents data bloat.
4. **Self-Cleaning Ecosystem (Dynamic TTL Decay):** Automated time-decay cutoff (24h temporary obstacles, 7d road defects) extended only by live community validation upvotes.
5. **Tactical Dark Slate Command Center:** `#020617` canvas styled with CartoDB Dark Matter tiles and severity radar pulses to prevent night-blindness and glare during night travel.
6. **Absolute Privacy:** Zero user tracking, historical breadcrumbs, or personal data collected.

---

## 🛠️ Tech Stack & Architecture

```
[ Frontend: React 19 + TypeScript + Vite + Tailwind CSS ]
   ├── Map Engine: Leaflet.js + CartoDB Dark Matter + Custom SVG DivIcons
   ├── Offline Engine: IndexedDB (idb wrapper) + Service Worker (Workbox Tile Caching)
   ├── State Stores: useGeolocation, useHazardManager, useSyncManager, usePWAInstall
   └── UI/UX: Bottom Sheets, Thumb-Zone HUD, 48px Touch Targets, Screen Wake Lock API
           │
           ▼ (HTTPS / REST / RPC)
[ Backend: Supabase + PostgreSQL + PostGIS ]
   ├── Table: `hazards` (location: GEOGRAPHY Point 4326, expires_at, upvotes)
   ├── Table: `hazard_validations` (audit trail, device_hash)
   ├── Spatial RPC: `get_hazards_in_radius(lat, lng, 5000)`
   ├── Validation RPC: `upvote_hazard(hazard_id, device_hash)`
   ├── Resolution RPC: `resolve_hazard(hazard_id, device_hash)`
   └── Security: Anonymous Row-Level Security (RLS) & Automated Decay Purge
```

---

## 📊 Hazard Domain Taxonomy & TTL Matrix

| Hazard Category | Key Trigger / Subtitle | Initial TTL | Upvote Bonus | Max Cap |
| :--- | :--- | :---: | :---: | :---: |
| **`road_obstruction`** | Harang sa Daan (Stalled vehicle, fallen branch, debris) | **24 Hours** | +12 Hours | 48 Hours |
| **`clogged_drainage`** | Baradong Kanal / Baha (Flash floods, waterlogged road) | **48 Hours** | +24 Hours | 5 Days |
| **`dark_street`** | Madilim na Kalsada (Broken streetlight, unlit corridor) | **72 Hours** | +24 Hours | 7 Days |
| **`pothole`** | Butas / Lubak / Bukas na Manhole (Asphalt defect) | **7 Days** | +48 Hours | 30 Days |

* **15-Meter Anti-Spam Rule:** Attempting to report the same category within 15m prompts the user to upvote the existing pin instead.
* **Community Resolution Decay:** 3 distinct "Mark Resolved" flags place a pin into a 20% faded soft-resolved state, decaying completely after 2 hours.
* **Device Fingerprinting:** LocalStorage token enforces 1 vote per hazard per device.

---

## 🎨 Visual Severity System (No Rainbow Pins)

- **High Danger (Critical):** Pure white `#ffffff` pin with active 1.8s `radar-pulse` ping animation and glowing outer wave.
- **Medium Warning:** Luminescent `#cbd5e1` pin with steady outer glow.
- **Low Caution:** Clean semi-translucent `#64748b` pin (70% opacity).
- **Soft-Resolved:** Faded 40% opacity indicator for community-resolved hazards.
- **Pending Sync:** Dashed amber border with sync warning glow.
- **GPS User Dot:** Sky-blue (`#38bdf8`) live location dot with animated accuracy radius ripple.

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/robertterquin/Bakas.git
cd Bakas
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy Database Schema to Supabase
Copy and run [`supabase/master_schema.sql`](supabase/master_schema.sql) in your Supabase SQL Editor.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 🧪 3-Minute Demo Flow

1. **0:00 - 0:20 (Instant Entry):** Open app $\rightarrow$ instant GPS lock on dark radar canvas with zero sign-up required.
2. **0:20 - 0:45 (Spatial Proximity):** View active hazards within 5km, toggle radius chips (1km walking / 3km cycling / 5km driving).
3. **0:45 - 1:15 (Fast Report < 5s):** Tap `+ Report Hazard` $\rightarrow$ tap category $\rightarrow$ tap severity $\rightarrow$ submit. Pin drops optimistically in 15ms.
4. **1:15 - 1:45 (Offline Simulation):** Toggle Airplane mode $\rightarrow$ drop a hazard pin. Stored safely in IndexedDB with amber pending badge.
5. **1:45 - 2:15 (Auto Background Sync):** Re-enable network $\rightarrow$ watch background sync flush queue to Supabase and update pin border to verified.
6. **2:15 - 2:40 (Community Upvoting):** Tap existing hazard $\rightarrow$ tap "Still Here (+1)". Extends TTL countdown and increases pulse intensity.
7. **2:40 - 3:00 (Handlebar Mount Mode):** Tap the Sun/Wake Lock button to keep screen active on bike/car mounts.

---

## 🛡️ License & Safety Disclaimer

Never interact with Bakás while driving. Use handlebar mounts in glanceable radar mode or report while safely stopped or as a passenger.

Built with extreme civic care for urban commuters everywhere.
