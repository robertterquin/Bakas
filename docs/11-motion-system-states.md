# 11 — Motion System & State Coverage

## 1. Motion Principles

Bakás uses functional, lightweight motion to communicate spatial context and system responsiveness. Animations never delay user action.

| Motion Type | Duration | Easing | Intent |
| :--- | :--- | :--- | :--- |
| **Radar Pulse** | 1.8s (infinite loop) | `cubic-bezier(0.4, 0, 0.6, 1)` | Communicates live active status of high-severity hazard pins. |
| **GPS Ripple** | 2.4s (infinite loop) | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Indicates live device geolocation precision. |
| **Bottom Sheet Slide** | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` (Spring ease-out) | Responsive feel when opening/closing report flows. |
| **Optimistic Pin Drop** | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` (Pop overshoot) | Instant tactile delight when a hazard is reported. |
| **Map Camera Fly-To** | 600ms – 1000ms | `easeInOutCubic` | Smooth transition when recentering on user or focusing a pin. |

---

## 2. Complete State Matrix

Every core screen and UI module in Bakás defines 6 fundamental states:

```
┌────────────────────────────────────────────────────────┐
│                      STATE MATRIX                      │
├─────────────────┬──────────────────────────────────────┤
│ 1. Empty State  │ No hazards found within 5km radius.   │
│                 │ Renders: "All clear within 5km radar."│
├─────────────────┼──────────────────────────────────────┤
│ 2. Loading State│ Initial GPS lock or PostGIS fetch.   │
│                 │ Renders: Sleek radar sweep animation. │
├─────────────────┼──────────────────────────────────────┤
│ 3. Success State│ Hazards loaded and rendered on map.  │
├─────────────────┼──────────────────────────────────────┤
│ 4. Offline State│ Device loses internet connection.     │
│                 │ Banner: "Offline Mode • Stored locally"│
├─────────────────┼──────────────────────────────────────┤
│ 5. Error State  │ GPS permission denied / network fail. │
│                 │ Actionable fallback button (Retry/Set)│
├─────────────────┼──────────────────────────────────────┤
│ 6. Syncing State│ Background sync pushing IndexedDB.    │
│                 │ Animated rotating sync badge.         │
└─────────────────┴──────────────────────────────────────┘
```

---

## 3. Geolocation Permission States

1. **Prompting / Initial:** Displays unobtrusive banner explaining why GPS is needed to show hazards near you.
2. **Granted:** Immediately calculates 5km bounds and locks camera to user dot.
3. **Denied / Blocked:** Gracefully centers on a sensible regional default (e.g., Metro Manila / City Center) and allows manual map dragging to report hazards.
4. **Low Accuracy / Timeout:** Warns user with a subtle location accuracy circle without blocking access to existing map data.
