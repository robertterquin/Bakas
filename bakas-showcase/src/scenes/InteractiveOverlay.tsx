import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, monoFont, fontFamily } from './shared'

// =============================================================================
// Sleek Tactile Touch Pointer with Spring Ripple (Pure Radial Interaction)
// =============================================================================
export const TouchPointer: React.FC<{
  x: number | string
  y: number | string
  scale?: number
  opacity?: number
  isTapping?: boolean
}> = ({ x, y, scale = 1, opacity = 1, isTapping = false }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        pointerEvents: 'none',
        zIndex: 90,
      }}
    >
      {/* Expanding Circular Ripple on Tap (Zero Rectangles) */}
      {isTapping && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 76,
            height: 76,
            borderRadius: '50%',
            border: '2px solid rgba(56, 189, 248, 0.95)',
            backgroundColor: 'rgba(56, 189, 248, 0.22)',
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.8), inset 0 0 15px rgba(56, 189, 248, 0.5)',
          }}
        />
      )}

      {/* Main Touch Pointer Disc */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.28)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6), 0 0 18px rgba(56, 189, 248, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 10px #ffffff',
          }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// Slide 1: Interactive Radar Overview (Radial Sonar Ping + Corner Telemetry)
// =============================================================================
export const InteractiveSlide1Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves in to tap on a central hazard pin at frame 50
  const pointerProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 90 },
  })

  const pointerX = interpolate(pointerProgress, [0, 1], [40, 77])
  const pointerY = interpolate(pointerProgress, [0, 1], [90, 67])
  const pointerOpacity = interpolate(frame, [15, 25, 105, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap action at frame 54-68
  const isTapping = frame >= 54 && frame <= 68
  const tapScale = interpolate(frame, [54, 58, 64], [1, 0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Radial ping shockwave from pin
  const pingScale = interpolate(frame, [56, 100], [0.6, 2.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const pingOpacity = interpolate(frame, [56, 75, 100], [0, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Floating pin callout chip
  const tooltipOpacity = interpolate(frame, [60, 70, 115, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Standalone Corner Telemetry Pill */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 16px',
          borderRadius: 999,
          backgroundColor: 'rgba(10, 15, 29, 0.88)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          fontFamily: monoFont,
          fontSize: 11,
          color: colors.white,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }}
        />
        <span style={{ color: colors.sky, fontWeight: 700 }}>GPS 14.5995°N, 120.9842°E</span>
        <span style={{ color: colors.textDim }}>//</span>
        <span style={{ color: colors.emerald }}>LIVE RADAR 30 FPS</span>
      </div>

      {/* Circular Ping Shockwave (Radial) */}
      <div
        style={{
          position: 'absolute',
          left: '77%',
          top: '67%',
          transform: `translate(-50%, -50%) scale(${pingScale})`,
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '2px solid rgba(56, 189, 248, 0.9)',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)',
          opacity: pingOpacity,
        }}
      />

      {/* Floating Target Pin Callout Tag */}
      <div
        style={{
          position: 'absolute',
          left: '77%',
          top: '59%',
          transform: 'translate(-50%, -100%)',
          backgroundColor: 'rgba(9, 14, 26, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 999,
          padding: '6px 14px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)',
          opacity: tooltipOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            boxShadow: '0 0 6px #ef4444',
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.white, fontFamily }}>
          Flooded Underpass
        </span>
        <span style={{ fontSize: 10, color: colors.sky, fontFamily: monoFont }}>
          • High Severity
        </span>
      </div>

      {/* Touch Pointer */}
      <TouchPointer
        x={`${pointerX}%`}
        y={`${pointerY}%`}
        scale={tapScale}
        opacity={pointerOpacity}
        isTapping={isTapping}
      />
    </div>
  )
}

// =============================================================================
// Slide 2: Interactive 1-Tap Hazard Reporting (Radial Spotlights + Floating Toast)
// No rectangular container boxes
// =============================================================================
export const InteractiveSlide2Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Phase 1: Pointer moves to "Flooding / Drainage" at frame 15-45
  // Phase 2: Pointer moves to "Drop Hazard Trace" at frame 58-85
  const isPhase1 = frame < 55

  const p1Progress = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 95 } })
  const p2Progress = spring({ frame: frame - 55, fps, config: { damping: 20, stiffness: 95 } })

  const pointerX = isPhase1
    ? interpolate(p1Progress, [0, 1], [30, 72])
    : interpolate(p2Progress, [0, 1], [72, 50])

  const pointerY = isPhase1
    ? interpolate(p1Progress, [0, 1], [65, 29])
    : interpolate(p2Progress, [0, 1], [29, 90])

  const pointerOpacity = interpolate(frame, [10, 20, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Taps
  const isTap1 = frame >= 44 && frame <= 54
  const isTap2 = frame >= 84 && frame <= 94
  const tapScale = isTap1
    ? interpolate(frame, [44, 48, 54], [1, 0.8, 1])
    : isTap2
    ? interpolate(frame, [84, 88, 94], [1, 0.8, 1])
    : 1

  // Soft Radial Spotlight upon tapping Flooding chip (no box borders!)
  const floodSpotlight = interpolate(frame, [44, 52, 90], [0, 0.8, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Radial Specular Glow upon pressing Submit button
  const submitGlow = interpolate(frame, [84, 90, 115], [0, 0.9, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Floating confirmation toast (floats cleanly above the card)
  const toastY = interpolate(frame, [88, 98], [-44, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const toastOpacity = interpolate(frame, [88, 98, 122, 132], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Soft Radial Spotlight on Flooding Chip Tap (Radial, No Box) */}
      <div
        style={{
          position: 'absolute',
          left: '72%',
          top: '29%',
          transform: 'translate(-50%, -50%)',
          width: 220,
          height: 120,
          borderRadius: 999,
          background:
            'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 70%)',
          opacity: floodSpotlight,
        }}
      />

      {/* Radial Specular Light on Submit Button Tap */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '90%',
          transform: 'translate(-50%, -50%)',
          width: 320,
          height: 90,
          borderRadius: 999,
          background:
            'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.5) 0%, rgba(56, 189, 248, 0.25) 45%, transparent 70%)',
          opacity: submitGlow,
        }}
      />

      {/* Self-Contained Floating Confirmation Toast (Above Card) */}
      <div
        style={{
          position: 'absolute',
          top: toastY,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0284c7',
          color: colors.white,
          borderRadius: 999,
          padding: '8px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 10px 30px rgba(2, 132, 199, 0.6), 0 0 20px rgba(56, 189, 248, 0.4)',
          opacity: toastOpacity,
          fontFamily,
          fontSize: 13,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 15 }}>✓</span>
        <span>Hazard Trace Live on Radar!</span>
      </div>

      {/* Touch Pointer */}
      <TouchPointer
        x={`${pointerX}%`}
        y={`${pointerY}%`}
        scale={tapScale}
        opacity={pointerOpacity}
        isTapping={isTap1 || isTap2}
      />
    </div>
  )
}

// =============================================================================
// Slide 3: Dynamic TTL Decay & Live Vouch Physics (Circular Gauge Spark + Badge)
// Zero rectangular box overlays
// =============================================================================
export const InteractiveSlide3Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves down to "+1 Still Here" button at frame 15-45
  const pProgress = spring({ frame: frame - 12, fps, config: { damping: 20, stiffness: 95 } })
  const pointerX = interpolate(pProgress, [0, 1], [60, 28])
  const pointerY = interpolate(pProgress, [0, 1], [60, 91])
  const pointerOpacity = interpolate(frame, [12, 22, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap event at frame 46
  const isTap = frame >= 45 && frame <= 55
  const tapScale = isTap ? interpolate(frame, [45, 49, 55], [1, 0.8, 1]) : 1

  // Post-vouch state
  const isVouched = frame >= 48

  // Vouch spark energy ring expanding over circular TTL gauge (purely radial circular ring)
  const sparkScale = interpolate(frame, [48, 75], [0.8, 1.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const sparkOpacity = interpolate(frame, [48, 58, 80], [0, 0.95, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Floating "+6h Vouch Extended!" badge
  const floatY = interpolate(frame, [48, 85], [0, -32], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const floatOpacity = interpolate(frame, [48, 56, 85, 95], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Vouched Circular Glow Ring over the Circular TTL Gauge (Purely Radial) */}
      {isVouched && (
        <div
          style={{
            position: 'absolute',
            left: '17.5%',
            top: '23%',
            transform: `translate(-50%, -50%) scale(${sparkScale})`,
            width: 76,
            height: 76,
            borderRadius: '50%',
            border: '2.5px solid #fbbf24',
            boxShadow: '0 0 25px #fbbf24, inset 0 0 15px #f59e0b',
            opacity: sparkOpacity,
          }}
        />
      )}

      {/* Floating Spark Badge (Self-Contained Pill) */}
      <div
        style={{
          position: 'absolute',
          left: '28%',
          top: `calc(83% + ${floatY}px)`,
          transform: 'translateX(-50%)',
          backgroundColor: '#059669',
          color: colors.white,
          borderRadius: 999,
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.6), 0 0 20px rgba(16, 185, 129, 0.4)',
          opacity: floatOpacity,
          fontFamily: monoFont,
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <span>⚡</span>
        <span>+6h TTL EXTENDED</span>
      </div>

      {/* Touch Pointer */}
      <TouchPointer
        x={`${pointerX}%`}
        y={`${pointerY}%`}
        scale={tapScale}
        opacity={pointerOpacity}
        isTapping={isTap}
      />
    </div>
  )
}

// =============================================================================
// Slide 4: Interactive Route Search (Radial Tap Light + Floating Route Pill)
// NO inaccurate rectangular container boxes!
// =============================================================================
export const InteractiveSlide4Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves smoothly to EDSA card at frame 20-50
  const pProgress = spring({ frame: frame - 18, fps, config: { damping: 20, stiffness: 95 } })
  const pointerX = interpolate(pProgress, [0, 1], [30, 52])
  const pointerY = interpolate(pProgress, [0, 1], [15, 34])
  const pointerOpacity = interpolate(frame, [16, 26, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap event on EDSA card
  const isTap = frame >= 50 && frame <= 62
  const tapScale = isTap ? interpolate(frame, [50, 54, 62], [1, 0.8, 1]) : 1

  // Soft Radial Spotlight Burst upon tap (smooth ellipse, zero rectangular edges)
  const burstOpacity = interpolate(frame, [50, 56, 95], [0, 0.9, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Floating confirmation tag for route selection (floats above the card)
  const tagY = interpolate(frame, [52, 62], [-44, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tagOpacity = interpolate(frame, [52, 62, 115, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Soft Radial Specular Spotlight (Radial, zero hard borders) */}
      <div
        style={{
          position: 'absolute',
          left: '52%',
          top: '34%',
          transform: 'translate(-50%, -50%)',
          width: 380,
          height: 140,
          borderRadius: 999,
          background:
            'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.45) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 70%)',
          opacity: burstOpacity,
        }}
      />

      {/* Floating Route Selected Toast (Above Card) */}
      <div
        style={{
          position: 'absolute',
          top: tagY,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(10, 15, 29, 0.95)',
          border: '1.5px solid #38bdf8',
          borderRadius: 999,
          padding: '7px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.35)',
          opacity: tagOpacity,
          fontFamily: monoFont,
          fontSize: 12,
          fontWeight: 700,
          color: colors.white,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: colors.sky, fontSize: 13 }}>✓</span>
        <span>EDSA CORRIDOR ACTIVE</span>
        <span style={{ color: colors.textDim }}>//</span>
        <span style={{ color: colors.sky }}>7.9 KM MONITORED</span>
      </div>

      {/* Touch Pointer */}
      <TouchPointer
        x={`${pointerX}%`}
        y={`${pointerY}%`}
        scale={tapScale}
        opacity={pointerOpacity}
        isTapping={isTap}
      />
    </div>
  )
}

// =============================================================================
// Slide 5: Interactive Offline Resilience (Floating Telemetry Island)
// Purely standalone floating status pill above card - zero card outlines
// =============================================================================
export const InteractiveSlide5Overlay: React.FC = () => {
  const frame = useCurrentFrame()

  // State transitions:
  // 0-35: Online
  // 35-68: Tunnel entered (Offline, IndexedDB active)
  // 68-105: Reconnected (Sync complete)
  const isTunnel = frame >= 35 && frame < 70
  const isSynced = frame >= 70

  const statusColor = isTunnel ? '#f59e0b' : isSynced ? '#10b981' : '#38bdf8'
  const statusText = isTunnel
    ? 'TUNNEL DETECTED • LOCAL IDB SAVING'
    : isSynced
    ? 'SIGNAL RESTORED • 3 TRACES SYNCED ✓'
    : 'CELLULAR ACTIVE • RADAR ONLINE'

  // Soft ambient pulse when offline mode triggers
  const ambientPulse = isTunnel
    ? interpolate(Math.sin((frame - 35) * 0.15), [-1, 1], [0.15, 0.35])
    : 0

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Floating Standalone Telemetry Island (Above Card, Zero Text Collisions) */}
      <div
        style={{
          position: 'absolute',
          top: -24,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(9, 14, 26, 0.95)',
          border: `1.5px solid ${statusColor}`,
          borderRadius: 999,
          padding: '8px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px ${statusColor}44`,
          fontFamily: monoFont,
          fontSize: 11,
          fontWeight: 800,
          color: colors.white,
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
          }}
        />
        <span>{statusText}</span>
      </div>

      {/* Soft Radial Ambient Beacon on Card (Pure Radial Glow, Zero Box Borders) */}
      {isTunnel && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '49%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            height: 180,
            borderRadius: 999,
            background:
              'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.35) 0%, transparent 70%)',
            opacity: ambientPulse,
          }}
        />
      )}
    </div>
  )
}
