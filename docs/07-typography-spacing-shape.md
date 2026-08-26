# 07 — Typography, Spacing, and Shape System

## 1. Typography Hierarchy

Bakás utilizes modern geometric sans-serif fonts optimized for fast visual scanning on mobile devices (e.g., `Inter`, system UI font stack).

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Title** | 24px (`text-2xl`) | Bold (`font-bold` / 700) | 1.25 | `-0.02em` | App brand name, modal headlines |
| **Heading** | 18px (`text-lg`) | Semibold (`font-semibold` / 600) | 1.30 | `-0.01em` | Hazard category names, section titles |
| **Subheading** | 15px (`text-base`) | Medium (`font-medium` / 500) | 1.40 | `0` | Card headers, severity labels |
| **Body Text** | 14px (`text-sm`) | Normal (`font-normal` / 400) | 1.50 | `0` | Descriptions, instructions, guides |
| **Caption / Meta** | 12px (`text-xs`) | Medium (`font-medium` / 500) | 1.40 | `+0.01em` | Distance metrics, timestamps, TTLs |
| **Monospace** | 12px (`text-xs`) | Medium (`font-mono` / 500) | 1.40 | `+0.02em` | Lat/Long coordinates, PostGIS debug |

---

## 2. Spacing Scale

Based on an **8pt grid** system with 4pt half-steps for micro-alignments:

- **`space-1` (4px):** Micro gaps between icons and labels, badge padding.
- **`space-2` (8px):** Chip internal padding, compact card margins.
- **`space-3` (12px):** Standard spacing between related elements.
- **`space-4` (16px):** Primary container gutters, modal body padding.
- **`space-6` (24px):** Section dividers, bottom sheet top handles to content.
- **`space-8` (32px):** Spacing between primary action blocks.

---

## 3. Shape & Corner Radii

Bakás utilizes clean, tactile rounded geometry designed for thumb ergonomics:

- **Pill Shapes (`rounded-full`):**
  - Category filter chips, status badges, floating action buttons (FABs).
- **Cards & Modals (`rounded-2xl` / 16px):**
  - Hazard detail bottom sheets, category selection tiles, dialog cards.
- **Micro-Controls (`rounded-xl` / 12px):**
  - Secondary action buttons, GPS recenter button, segmented controls.
- **Elevation Shadows:**
  - `shadow-lg` combined with `border border-slate-800` to create tactile separation above the dark Leaflet map layer.
