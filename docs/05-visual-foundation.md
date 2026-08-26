# 05 — Visual Foundation & Aesthetic Philosophy

## 1. Aesthetic Intent: Tactical Urban Command Center
Bakás adopts a **Dark Slate Monochrome & Radar Luminescence** design philosophy. Instead of a chaotic, rainbow-colored map filled with saturated red/yellow/green pins that cause visual fatigue during nighttime travel, Bakás operates like an advanced tactical command center or marine sonar radar.

---

## 2. Core Visual Tenets

### 1. Deep Midnight Contrast
- **Base Canvas (`#020617` / Slate-950):** Provides a soothing, battery-saving dark ground for OLED mobile displays and prevents night-blindness for motorists.
- **Elevated Surfaces (`#0f172a` / Slate-900 & `#1e293b` / Slate-800):** Visual depth is achieved through layered slate elevations, subtle 1px border accents (`#334155`), and soft tactical backdrop blurs (`backdrop-blur-md`).

### 2. Monochromatic Severity via Opacity & Pulse Frequency
- Rather than relying on confusing color codes, severity is communicated through **luminance, opacity, and radar pulse cadence**:
  - **Low Severity:** Static, clean semi-translucent slate/white pin (`opacity: 0.65`, 12px dot).
  - **Medium Severity:** Luminescent white pin with steady outer glow (`opacity: 0.85`, 16px dot).
  - **High / Critical Danger:** Pure white `#ffffff` center with continuous, high-visibility pulsing radar waves (`animation: radar-ping 1.8s infinite`).

### 3. CartoDB Dark Matter Map Harmony
- The Leaflet map tiles use the **CartoDB Dark Matter** theme.
- Roads, water bodies, and terrain blend seamlessly with the app shell, allowing user location and hazard radar traces to stand out with unmistakable contrast.

### 4. Precision Micro-Details
- Clean geometric icons with 1.5px stroke width.
- Crisp 1px borders with slate-700/800 dividers.
- Rounded modern cards (`rounded-2xl` for sheets, `rounded-full` for chips and controls).
- High readability typography with crisp tracking for numbers and coordinates.
