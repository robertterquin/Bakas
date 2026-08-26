# 12 — Domain Rules Affecting UX

## 1. Spatial Proximity Rules (PostGIS 5km Filter)

- **Hard 5km Limit:** Only hazards within `ST_DWithin(location, ST_SetSRID(ST_Point(lng, lat), 4326), 5000)` are fetched.
- **Viewport Dynamic Loading:** When the user pans the map beyond a 1.5km delta from their previous query center, a debounced query (300ms) fetches hazards for the new center.
- **Deduplication Radius (Anti-Spam):** If a user attempts to report a hazard of the *same category* within **15 meters** of an existing active pin, the UI prompts: *"A similar hazard was recently reported here. Would you like to upvote it instead?"*

---

## 2. Automated Data Decay & TTL (Time-To-Live) Matrix

To prevent obsolete "ghost hazards" from cluttering the map, Bakás enforces automated time decay based on hazard nature:

| Hazard Category | Initial TTL | Upvote Bonus | Max Cap | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **`road_obstruction`** (Stalled vehicle, fallen tree, debris) | **24 Hours** | +12 Hours per upvote | 48 Hours | Temporary obstacles are usually cleared within hours by traffic enforcers or towing services. |
| **`dark_street`** (Broken lamppost, unlit road section) | **72 Hours** | +24 Hours per upvote | 7 Days | Power outages or streetlamp repairs fluctuate weekly. |
| **`clogged_drainage`** (Flooding / waterlogged street) | **48 Hours** | +24 Hours per upvote | 5 Days | Floodwaters recede or drain declogging occurs post-storm. |
| **`pothole`** (Damaged asphalt, open manhole) | **7 Days** | +48 Hours per upvote | 30 Days | Physical structural defects persist until public works maintenance repairs them. |

---

## 3. Community Validation & Resolution Rules

1. **"Still Here" Upvotes:**
   - Increments upvote count.
   - Pushes the `expires_at` timestamp further into the future (up to the category max cap).
   - Increases marker visual luminance and pulse intensity.
2. **"Mark Resolved / Cleared":**
   - When **3 distinct community users** mark a hazard as resolved, the pin enters a "Soft Resolved" state (faded 20% opacity) and decays completely after 2 hours unless disputed.
3. **Sybil & Spam Protection (Client-Side Fingerprinting):**
   - Uses local device fingerprinting and localStorage tokens to enforce **1 upvote/resolve action per hazard per device**.

---

## 4. Offline Sync & Conflict Resolution Rules

1. **Client-Generated UUIDs:** When an offline report is created, the client generates a v4 UUID locally.
2. **Post-Reconnect Ingestion:** When the browser fires the `online` event or Service Worker background sync triggers, the queue in IndexedDB is flushed sequentially.
3. **Server-Side PostGIS Point Transformation:** Latitude and Longitude are stored as standard `GEOGRAPHY(Point, 4326)` in PostgreSQL for spatial indexing and radius calculations.
