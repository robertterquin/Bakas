# 03 — User Journeys

## Journey 1: The Quick Report (Under 5 Seconds)
**Scenario:** A motorcycle courier encounters a dangerous unlit pothole on a rain-slicked highway.

```
[ Opens PWA / Shortcut ]
      │ (Instant GPS Lock < 1 sec)
      ▼
[ Tap Large "Report Hazard" FAB ]
      │ (Report bottom sheet slides up)
      ▼
[ 1-Tap Category: "Pothole" ] ➔ [ 1-Tap Severity: "High" ]
      │
      ▼
[ Tap "Submit Trace" ]
      │
      ├── Instant Optimistic UI: Pin immediately appears as pulsing white radar trace
      ├── Local DB: Written to IndexedDB in 15ms
      └── Network: Dispatched to Supabase PostGIS endpoint in background
```
- **Exit Gate:** User is back on the live map in under 5 seconds with zero typing required.

---

## Journey 2: Offline Reporting in Cellular Dead Zone
**Scenario:** A driver spots an open drainage manhole in a mountainous or underground road sector with no LTE/5G signal.

```
[ Driver Opens Bakás in Dead Zone ]
      │ (Service Worker serves app shell + cached CartoDB tiles)
      ▼
[ Tap "Report Hazard" ]
      │ (Device GPS operates via hardware satellite receiver)
      ▼
[ Select "Clogged Drainage / Open Manhole" & "High Severity" ]
      │
      ▼
[ Tap "Submit" ]
      │
      ├── UI Indicator: Shows "Saved Offline • 1 Pending Sync"
      ├── Pin appears on local map with dashed amber sync border
      └── Storage: Stored securely in IndexedDB `pending_reports`
      │
      ▼ (Later: Device reconnects to cellular data)
[ Background Sync Triggered ]
      │
      ├── IndexedDB batches pending records to Supabase API
      ├── Database assigns official UUID and timestamp
      └── UI updates pin border to solid verified radar trace; toast displays "Sync Complete"
```

---

## Journey 3: Community Validation (Extending Data TTL)
**Scenario:** A pedestrian notices a marked pothole that has worsened. They validate the report.

```
[ Pedestrian walks within 500m of marked hazard ]
      │
      ▼
[ Taps pulsing pin on map ]
      │ (Hazard Detail Sheet opens)
      ▼
[ Views Details: "Pothole • High Severity • 4 upvotes • Expires in 2 days" ]
      │
      ▼
[ Taps "Still Here (Upvote)" ]
      │
      ├── Upvote count increments (4 ➔ 5)
      ├── Local device fingerprint prevents duplicate voting
      ├── Supabase function recalculates `expires_at` (extends TTL by +48 hours)
      └── Pin pulse intensity refreshes
```

---

## Journey 4: The Nighttime Commute Glance
**Scenario:** A cyclist checks their local area before riding home at midnight.

```
[ Opens Bakás on mobile browser ]
      │ (Dark slate monochrome theme prevents night-blindness)
      ▼
[ Glances at 5km Radar Viewport ]
      │
      ├── Filters map to "Dark Street" & "Road Obstruction"
      ├── Identifies 2 unlit road sectors and 1 construction debris marker
      └── Plans detour around hazardous streets
```
