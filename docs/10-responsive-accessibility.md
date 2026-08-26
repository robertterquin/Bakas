# 10 — Responsive Design & Accessibility (a11y)

## 1. Responsive Viewport Strategy

Bakás is designed **mobile-first** because 95%+ of usage occurs on smartphones during transit. However, it scales cleanly across tablets and desktop dashboards.

| Viewport | Range | Layout Strategy |
| :--- | :--- | :--- |
| **Mobile (Primary)** | 320px – 640px | Fullscreen map with floating HUD overlays and bottom sheets (`w-full max-h-[85vh]`). |
| **Tablet** | 641px – 1024px | Centered bottom sheet or side panel (max width 480px), centered action buttons. |
| **Desktop / Monitor** | 1025px+ | Side-docked hazard inspection drawer (left panel `w-96`), expanded map radar canvas. |

---

## 2. Touch Target Ergonomics
- All interactive controls (FABs, category buttons, filter chips, recenter targets) adhere to a **minimum 48x48px touch target**.
- Primary CTA buttons span the full sheet width (`h-14` / 56px) for effortless 1-handed thumb access while on the move.

---

## 3. Accessibility & Assistive Technology (WCAG 2.1 AA)

### 1. Screen Reader Compatibility (ARIA)
- Map markers include descriptive `aria-label` tags (e.g., `aria-label="Pothole, High severity, 350 meters away, 4 community upvotes"`).
- Bottom sheets use `role="dialog"` with `aria-modal="true"` and proper `aria-labelledby` headings.
- Live region announcements (`aria-live="polite"`) notify users when a hazard is reported or when sync completes.

### 2. Reduced Motion Support (`prefers-reduced-motion`)
- Users with vestibular motion sensitivities can enable reduced motion.
- Continuous radar pulsing animations and map fly-to zooms are replaced with instant static opacity indicators and immediate camera pans.

### 3. Keyboard Navigation & Focus Rings
- Full tab-index traversal across filters, map pin listings, and report dialogs.
- High-visibility `focus-visible:ring-2 focus-visible:ring-sky-400` outlines on all interactive elements.
