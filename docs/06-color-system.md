# 06 — Color System & Design Tokens

## 1. Palette Architecture

Bakás uses a strictly curated palette based on Tailwind CSS `slate` tones paired with radar luminescence accents.

| Token Name | Hex Code | Tailwind Equivalent | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **`bg-canvas`** | `#020617` | `slate-950` | Full-screen app background, map background underlay. |
| **`bg-surface`** | `#0f172a` | `slate-900` | Primary bottom sheets, modals, floating action bars, cards. |
| **`bg-surface-elevated`**| `#1e293b` | `slate-800` | Input backgrounds, chip backgrounds, hovered elements. |
| **`border-subtle`** | `#334155` | `slate-700` | 1px card borders, sheet dividers, modal separators. |
| **`border-focus`** | `#64748b` | `slate-500` | Active inputs, focused buttons, selected category borders. |
| **`text-primary`** | `#f8fafc` | `slate-50` | Primary headlines, category titles, active button text. |
| **`text-secondary`** | `#94a3b8` | `slate-400` | Supporting metadata, timestamps, distance labels, descriptions. |
| **`text-muted`** | `#64748b` | `slate-500` | Inactive chips, disabled states, coordinate captions. |
| **`accent-radar`** | `#ffffff` | `white` | Critical hazard pins, active radar ping, primary CTA button. |
| **`accent-gps`** | `#38bdf8` | `sky-400` | User current GPS location dot and accuracy circle ripple. |
| **`accent-sync-warn`** | `#f59e0b` | `amber-500` | Offline pending sync indicator badge and offline warning banner. |
| **`accent-success`** | `#10b981` | `emerald-500` | Sync completed badge, validated hazard status. |

---

## 2. Semantic Marker Tokens

```css
/* Hazard Pin Severity Styles */
.hazard-pin-low {
  background-color: #64748b; /* slate-500 */
  box-shadow: 0 0 6px rgba(100, 116, 139, 0.4);
  opacity: 0.70;
}

.hazard-pin-medium {
  background-color: #cbd5e1; /* slate-300 */
  box-shadow: 0 0 12px rgba(203, 213, 225, 0.6);
  opacity: 0.90;
}

.hazard-pin-high {
  background-color: #ffffff; /* pure white */
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.9);
  animation: radar-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.user-gps-pulse {
  background-color: #38bdf8; /* sky-400 */
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.8);
}
```

---

## 3. Contrast Ratios & WCAG 2.1 Compliance

- **`text-primary` (`#f8fafc`) on `bg-canvas` (`#020617`):** Contrast ratio **18.2:1** (Exceeds WCAG AAA standard).
- **`text-primary` (`#f8fafc`) on `bg-surface` (`#0f172a`):** Contrast ratio **15.4:1** (Exceeds WCAG AAA standard).
- **`text-secondary` (`#94a3b8`) on `bg-surface` (`#0f172a`):** Contrast ratio **6.8:1** (Exceeds WCAG AA standard).
- **High-contrast CTA (`#ffffff` text on `#0f172a` with `#38bdf8` accent):** Optimized for outdoor glaring sunlight.
