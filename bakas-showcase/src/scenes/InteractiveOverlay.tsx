import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

// =============================================================================
// Minimalist Tactile Touch Pointer (Refined Glass Disc + Delicate Spring Ripple)
// Purely minimal, zero artificial container boxes or text clutter
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
      {/* Delicate Expanding Tap Ripple */}
      {isTapping && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '1.5px solid rgba(56, 189, 248, 0.8)',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)',
          }}
        />
      )}

      {/* Sleek Minimalist Glass Disc */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 0 10px rgba(56, 189, 248, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 6px #ffffff',
          }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// Slide 1: Interactive Radar Overview (Subtle Marker Tap + Sonar Ripple)
// =============================================================================
export const InteractiveSlide1Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves in smoothly to tap on the central hazard pin
  const pointerProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 22, stiffness: 85 },
  })

  const pointerX = interpolate(pointerProgress, [0, 1], [45, 77])
  const pointerY = interpolate(pointerProgress, [0, 1], [85, 67])
  const pointerOpacity = interpolate(frame, [18, 28, 105, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap action
  const isTapping = frame >= 54 && frame <= 68
  const tapScale = interpolate(frame, [54, 58, 64], [1, 0.82, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Gentle radial sonar ripple from pin upon tap
  const pingScale = interpolate(frame, [56, 95], [0.8, 2.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const pingOpacity = interpolate(frame, [56, 72, 95], [0, 0.7, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Concentric Sonar Pulse from Pin */}
      <div
        style={{
          position: 'absolute',
          left: '77%',
          top: '67%',
          transform: `translate(-50%, -50%) scale(${pingScale})`,
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: '1.5px solid rgba(56, 189, 248, 0.75)',
          opacity: pingOpacity,
        }}
      />

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
// Slide 2: Interactive 1-Tap Hazard Reporting (2-Tap Category & Submit Motion)
// =============================================================================
export const InteractiveSlide2Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Phase 1: Tap "Flooding / Drainage" chip
  // Phase 2: Tap "Drop Hazard Trace" button
  const isPhase1 = frame < 55

  const p1Progress = spring({ frame: frame - 12, fps, config: { damping: 22, stiffness: 85 } })
  const p2Progress = spring({ frame: frame - 55, fps, config: { damping: 22, stiffness: 85 } })

  const pointerX = isPhase1
    ? interpolate(p1Progress, [0, 1], [30, 72])
    : interpolate(p2Progress, [0, 1], [72, 50])

  const pointerY = isPhase1
    ? interpolate(p1Progress, [0, 1], [65, 29])
    : interpolate(p2Progress, [0, 1], [29, 90])

  const pointerOpacity = interpolate(frame, [12, 22, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const isTap1 = frame >= 44 && frame <= 54
  const isTap2 = frame >= 84 && frame <= 94
  const tapScale = isTap1
    ? interpolate(frame, [44, 48, 54], [1, 0.82, 1])
    : isTap2
    ? interpolate(frame, [84, 88, 94], [1, 0.82, 1])
    : 1

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
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
// Slide 3: Dynamic TTL Decay & Live Vouch Physics (Vouch Tap + Subtle Ring Surge)
// =============================================================================
export const InteractiveSlide3Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves down to "+1 Still Here" button
  const pProgress = spring({ frame: frame - 14, fps, config: { damping: 22, stiffness: 85 } })
  const pointerX = interpolate(pProgress, [0, 1], [55, 28])
  const pointerY = interpolate(pProgress, [0, 1], [65, 91])
  const pointerOpacity = interpolate(frame, [14, 24, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const isTap = frame >= 46 && frame <= 56
  const tapScale = isTap ? interpolate(frame, [46, 50, 56], [1, 0.82, 1]) : 1

  // Subtle circular energy ring around the TTL gauge
  const isVouched = frame >= 48
  const sparkScale = interpolate(frame, [48, 78], [0.9, 1.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const sparkOpacity = interpolate(frame, [48, 56, 78], [0, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {/* Subtle Energy Pulse around Circular TTL Gauge */}
      {isVouched && (
        <div
          style={{
            position: 'absolute',
            left: '17.5%',
            top: '23%',
            transform: `translate(-50%, -50%) scale(${sparkScale})`,
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '2px solid rgba(251, 191, 36, 0.85)',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
            opacity: sparkOpacity,
          }}
        />
      )}

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
// Slide 4: Interactive Route Search (Smooth Pointer Glide & Corridor Tap)
// =============================================================================
export const InteractiveSlide4Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves smoothly to EDSA card
  const pProgress = spring({ frame: frame - 18, fps, config: { damping: 22, stiffness: 85 } })
  const pointerX = interpolate(pProgress, [0, 1], [35, 52])
  const pointerY = interpolate(pProgress, [0, 1], [18, 34])
  const pointerOpacity = interpolate(frame, [18, 28, 110, 125], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap event on EDSA card
  const isTap = frame >= 50 && frame <= 62
  const tapScale = isTap ? interpolate(frame, [50, 54, 62], [1, 0.82, 1]) : 1

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
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
// Slide 5: Interactive Offline Resilience (Pointer Highlights Offline Row)
// =============================================================================
export const InteractiveSlide5Overlay: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Pointer moves smoothly to the Offline-First Resilience row to highlight it
  const pProgress = spring({ frame: frame - 18, fps, config: { damping: 22, stiffness: 85 } })
  const pointerX = interpolate(pProgress, [0, 1], [38, 50])
  const pointerY = interpolate(pProgress, [0, 1], [70, 49])
  const pointerOpacity = interpolate(frame, [18, 28, 85, 98], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Tap event
  const isTap = frame >= 46 && frame <= 58
  const tapScale = isTap ? interpolate(frame, [46, 50, 58], [1, 0.82, 1]) : 1

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
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
