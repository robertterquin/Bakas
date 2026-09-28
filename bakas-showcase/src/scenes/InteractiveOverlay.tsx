import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, monoFont, fontFamily } from './shared'

// =============================================================================
// Sleek Tactile Touch Pointer with Spring Ripple
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
      {/* Expanding Ripple on Tap */}
      {isTapping && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2.5px solid rgba(56, 189, 248, 0.95)',
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
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
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255, 255, 255, 0.9)',
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
// Slide 1: Interactive Radar Overview (Live GPS Telemetry + Marker Ping)
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

  // Tap action at frame 55-65
  const isTapping = frame >= 54 && frame <= 68
  const tapScale = interpolate(frame, [54, 58, 64], [1, 0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Ping shockwave from pin
  const pingScale = interpolate(frame, [56, 100], [0.6, 2.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const pingOpacity = interpolate(frame, [56, 75, 100], [0, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tooltip popup
  const tooltipOpacity = interpolate(frame, [60, 70, 115, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Live Telemetry Pill */}
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

      {/* Ping Shockwave on Tapped Pin */}
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

      {/* Target Pin Selection Tooltip */}
      <div
        style={{
          position: 'absolute',
          left: '77%',
          top: '59%',
          transform: 'translate(-50%, -100%)',
          backgroundColor: 'rgba(9, 14, 26, 0.94)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 12,
          padding: '8px 14px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.2)',
          opacity: tooltipOpacity,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
        </div>
        <span style={{ fontSize: 10, color: colors.sky, fontFamily: monoFont }}>
          High Severity • 9.2 km away
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
// Slide 2: Interactive 1-Tap Hazard Reporting (Selects Category -> Submits)
// =============================================================================
export const InteractiveSlide2Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Phase 1: Pointer moves to "Flooding / Drainage" button at frame 15-45
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

  // "Flooding / Drainage" button selection highlight after tap 1
  const isFloodSelected = frame >= 48

  // Submit button reaction after tap 2
  const isButtonSubmitted = frame >= 88

  // Floating confirmation toast
  const toastY = interpolate(frame, [88, 98], [-20, 14], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const toastOpacity = interpolate(frame, [88, 98, 122, 132], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Flooding Button Highlight Box (Overlays the right card chip) */}
      {isFloodSelected && (
        <div
          style={{
            position: 'absolute',
            left: '52%',
            top: '23%',
            width: '43%',
            height: '11.5%',
            borderRadius: 18,
            border: '2px solid #38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.4), inset 0 0 15px rgba(56, 189, 248, 0.2)',
          }}
        />
      )}

      {/* Button Pressed Flash */}
      {isButtonSubmitted && (
        <div
          style={{
            position: 'absolute',
            left: '5%',
            bottom: '2.5%',
            width: '90%',
            height: '9%',
            borderRadius: 18,
            border: '2px solid #ffffff',
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
          }}
        />
      )}

      {/* Confirmation Toast */}
      <div
        style={{
          position: 'absolute',
          top: toastY,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0284c7',
          color: colors.white,
          borderRadius: 999,
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 10px 30px rgba(2, 132, 199, 0.6), 0 0 20px rgba(56, 189, 248, 0.4)',
          opacity: toastOpacity,
          fontFamily,
          fontSize: 13,
          fontWeight: 700,
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
// Slide 3: Dynamic TTL Decay & Live Vouch Physics (+6h Energy Spark)
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

  // Vouch spark energy ring expanding over TTL gauge
  const sparkScale = interpolate(frame, [48, 75], [0.8, 1.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const sparkOpacity = interpolate(frame, [48, 58, 80], [0, 0.9, 0], {
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
      {/* Vouched Glow Ring over the Circular TTL Gauge (left: 17%, top: 23%) */}
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

      {/* Floating Spark Badge */}
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

      {/* Dynamic Vouch Counter Badge Highlight (cleanly covers the original badge) */}
      {isVouched && (
        <div
          style={{
            position: 'absolute',
            right: '8.4%',
            top: '19.8%',
            width: 104,
            height: 30,
            backgroundColor: '#0c1322',
            border: '1.5px solid #10b981',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            color: '#10b981',
            fontFamily: monoFont,
            fontSize: 11,
            fontWeight: 800,
            boxShadow: '0 0 18px rgba(16, 185, 129, 0.45)',
          }}
        >
          <span>✓</span>
          <span>3 vouches</span>
        </div>
      )}

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
// Slide 4: Interactive Route Search (Simulated Typing + Corridor Selection)
// =============================================================================
export const InteractiveSlide4Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Typewriter effect for "EDSA"
  // Frames 15-40
  const typedText =
    frame < 18
      ? ''
      : frame < 24
      ? 'E'
      : frame < 30
      ? 'ED'
      : frame < 36
      ? 'EDS'
      : 'EDSA'

  // Blinking caret
  const showCaret = Math.floor(frame / 6) % 2 === 0

  // Pointer moves down to EDSA card at frame 45-65
  const pProgress = spring({ frame: frame - 42, fps, config: { damping: 20, stiffness: 95 } })
  const pointerX = interpolate(pProgress, [0, 1], [30, 52])
  const pointerY = interpolate(pProgress, [0, 1], [15, 34])
  const pointerOpacity = interpolate(frame, [38, 48, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap at frame 68
  const isTap = frame >= 66 && frame <= 76
  const tapScale = isTap ? interpolate(frame, [66, 70, 76], [1, 0.8, 1]) : 1

  // Card highlight after selection
  const isCardSelected = frame >= 70

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Typewriter Input Simulation Overlay with dark background mask covering placeholder */}
      {frame >= 18 && (
        <div
          style={{
            position: 'absolute',
            left: '8.8%',
            top: '3.8%',
            width: '78%',
            height: '7.8%',
            backgroundColor: '#0a0f1d',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
            fontFamily,
            fontSize: 16,
            color: colors.white,
            fontWeight: 500,
          }}
        >
          <span>{typedText}</span>
          {frame < 60 && (
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: 18,
                backgroundColor: '#38bdf8',
                marginLeft: 2,
                opacity: showCaret ? 1 : 0,
              }}
            />
          )}
        </div>
      )}

      {/* Selected Card Highlight */}
      {isCardSelected && (
        <div
          style={{
            position: 'absolute',
            left: '3%',
            top: '25.5%',
            width: '94%',
            height: '16%',
            borderRadius: 22,
            border: '2px solid #38bdf8',
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.2)',
          }}
        />
      )}

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
// Slide 5: Interactive Offline Resilience (Tunnel Signal Loss -> Local Sync)
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

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Dynamic Status Tag inside Offline Resilience Row */}
      <div
        style={{
          position: 'absolute',
          right: '12%',
          top: '46.2%',
          backgroundColor: isTunnel
            ? 'rgba(245, 158, 11, 0.25)'
            : isSynced
            ? 'rgba(16, 185, 129, 0.25)'
            : 'rgba(56, 189, 248, 0.15)',
          border: `1px solid ${statusColor}`,
          borderRadius: 999,
          padding: '3px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: monoFont,
          fontSize: 10,
          fontWeight: 800,
          color: statusColor,
          boxShadow: `0 0 15px ${statusColor}44`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
          }}
        />
        <span>{isTunnel ? 'TUNNEL • IDB ACTIVE' : isSynced ? '3 TRACES SYNCED ✓' : 'ONLINE'}</span>
      </div>

      {/* Card Border Pulse on Offline Resilience row */}
      {(isTunnel || isSynced) && (
        <div
          style={{
            position: 'absolute',
            left: '9%',
            top: '44%',
            width: '82%',
            height: '10.5%',
            borderRadius: 18,
            border: `2px solid ${statusColor}`,
            boxShadow: `0 0 25px ${statusColor}44, inset 0 0 15px ${statusColor}22`,
          }}
        />
      )}
    </div>
  )
}
