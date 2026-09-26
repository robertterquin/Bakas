import React from 'react'
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import {
  BackgroundSonar,
  BakasBrandMark,
  colors,
  fontFamily,
  GlassCaption,
  monoFont,
  TacticalFrame,
} from './scenes/shared'

/**
 * Reusable modal card cropper to isolate modal dialogs cleanly over the live radar map
 */
const FloatingModalCard: React.FC<{
  src: string
  width?: number
  height: number
  offsetY: number
  glowColor?: string
}> = ({ src, width = 450, height, offsetY, glowColor = 'rgba(56, 189, 248, 0.25)' }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        border: '1.5px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `0 25px 70px rgba(0,0,0,0.95), 0 0 40px ${glowColor}`,
        backgroundColor: '#09090c',
        flexShrink: 0,
      }}
    >
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: -735,
          top: -offsetY,
          width: 1920,
          height: 1080,
          maxWidth: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// =============================================================================
// Scene 1: Tactical Radar Sonar Hook (0.0s – 3.5s | Frames 0 – 105)
// =============================================================================
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sweepAngle = (frame * 4) % 360

  const logoSpring = spring({ frame, fps, config: { damping: 130, stiffness: 90 } })
  const textSpring = spring({ frame: frame - 10, fps, config: { damping: 140, stiffness: 95 } })
  const subSpring = spring({ frame: frame - 20, fps, config: { damping: 140, stiffness: 95 } })
  const pillSpring = spring({ frame: frame - 32, fps, config: { damping: 140, stiffness: 100 } })

  // Expanding radar pulse waves
  const pulse1 = (frame % 45) / 45
  const pulse2 = ((frame + 15) % 45) / 45
  const pulse3 = ((frame + 30) % 45) / 45

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar sweepAngle={sweepAngle} opacity={0.95} />

      {/* Pulsing Sonar Ring Elements */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1.5px solid rgba(56, 189, 248, 0.5)',
          transform: `scale(${1 + pulse1 * 1.4})`,
          opacity: 1 - pulse1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1.5px solid rgba(56, 189, 248, 0.5)',
          transform: `scale(${1 + pulse2 * 1.4})`,
          opacity: 1 - pulse2,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1.5px solid rgba(56, 189, 248, 0.5)',
          transform: `scale(${1 + pulse3 * 1.4})`,
          opacity: 1 - pulse3,
          pointerEvents: 'none',
        }}
      />

      {/* Main Brand Mark & Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          opacity: logoSpring,
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.82, 1])}) translateY(${interpolate(logoSpring, [0, 1], [24, 0])}px)`,
        }}
      >
        <div style={{ transform: `rotate(${frame * 0.3}deg)`, marginBottom: 12 }}>
          <BakasBrandMark size={148} withGlow={true} />
        </div>

        {/* Kicker */}
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 14,
            fontWeight: 800,
            color: colors.sky,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 8,
            textShadow: '0 0 16px rgba(56, 189, 248, 0.6)',
          }}
        >
          [ CIVIC TELEMETRY // ROUTE DEFENSE ]
        </div>

        <h1
          style={{
            fontSize: 108,
            fontWeight: 900,
            color: colors.white,
            margin: 0,
            letterSpacing: -3,
            fontFamily,
            lineHeight: 1,
            textShadow: '0 0 40px rgba(56, 189, 248, 0.35)',
          }}
        >
          Bakás
        </h1>

        <p
          style={{
            fontSize: 38,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 60%, #7dd3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: 12,
            marginBottom: 10,
            opacity: textSpring,
            transform: `translateY(${interpolate(textSpring, [0, 1], [14, 0])}px)`,
            fontFamily,
            letterSpacing: -0.5,
          }}
        >
          Urban Road Hazard Radar
        </p>

        <p
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: colors.textMuted,
            maxWidth: 780,
            textAlign: 'center',
            margin: '8px 0 24px 0',
            opacity: subSpring,
            transform: `translateY(${interpolate(subSpring, [0, 1], [14, 0])}px)`,
            fontFamily,
            lineHeight: 1.4,
          }}
        >
          Real-time spatial alerts • Community flood passability • 1-tap route defense
        </p>

        {/* Telemetry Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 999,
            padding: '10px 24px',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)',
            opacity: pillSpring,
            transform: `scale(${interpolate(pillSpring, [0, 1], [0.9, 1])}) translateY(${interpolate(pillSpring, [0, 1], [14, 0])}px)`,
            fontFamily: monoFont,
            fontSize: 14,
            color: colors.white,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: colors.emerald,
              boxShadow: '0 0 10px #10b981',
            }}
          />
          <span style={{ fontWeight: 700, color: colors.emerald }}>GPS ACTIVE</span>
          <span style={{ color: colors.border }}>|</span>
          <span style={{ color: colors.textMuted }}>14.5995° N, 120.9842° E</span>
          <span style={{ color: colors.border }}>|</span>
          <span style={{ color: colors.sky }}>MANILA METRO RADAR READY</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 2: Real-Time Spatial Radar & Scope Intelligence (3.5s – 8.0s | Frames 105 – 240)
// =============================================================================
const SpatialRadarScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sweepAngle = (frame * 5) % 360

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })
  const scopeZoom = interpolate(frame, [0, 135], [1.0, 1.07], { extrapolateRight: 'clamp' })
  const cameraY = interpolate(frame, [0, 135], [0, -18], { extrapolateRight: 'clamp' })

  // Staggered telemetry cards
  const card1Spring = spring({ frame: frame - 22, fps, config: { damping: 130, stiffness: 110 } })
  const card2Spring = spring({ frame: frame - 44, fps, config: { damping: 130, stiffness: 110 } })
  const card3Spring = spring({ frame: frame - 66, fps, config: { damping: 130, stiffness: 110 } })

  // Live GPS ripple pulses
  const ripple1 = (frame % 30) / 30
  const ripple2 = ((frame + 15) % 30) / 30

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar sweepAngle={sweepAngle} opacity={0.65} />

      {/* Main Viewport Mockup */}
      <div
        style={{
          transform: `scale(${introSpring * scopeZoom}) translateY(${cameraY}px)`,
          opacity: introSpring,
          transition: 'transform 0.1s ease-out',
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Captured Map View */}
            <Img
              src={staticFile('captures/capture-1-radar-overview.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.96) contrast(1.05)',
              }}
            />

            {/* Central Animated GPS Pulsing Reticle */}
            <div
              style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              {/* Expanding Ripple 1 */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${1 + ripple1 * 4})`,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '2px solid rgba(56, 189, 248, 0.7)',
                  opacity: 1 - ripple1,
                }}
              />
              {/* Expanding Ripple 2 */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${1 + ripple2 * 4})`,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: '2px solid rgba(56, 189, 248, 0.7)',
                  opacity: 1 - ripple2,
                }}
              />
              {/* Core Beacon Dot */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 20px #38bdf8, 0 0 35px #0284c7',
                  border: '3px solid #ffffff',
                }}
              />
            </div>

            {/* Live Sweeping Radar Cone Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 900,
                height: 900,
                borderRadius: '50%',
                background: `conic-gradient(from ${sweepAngle}deg at 50% 50%, rgba(56, 189, 248, 0.22) 0deg, rgba(56, 189, 248, 0.03) 40deg, transparent 70deg)`,
                pointerEvents: 'none',
              }}
            />

            {/* Top Scope Telemetry Ribbon */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: 'rgba(5, 7, 10, 0.92)',
                border: '1.5px solid rgba(56, 189, 248, 0.45)',
                borderRadius: 999,
                padding: '10px 28px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(16px)',
                fontFamily: monoFont,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.sky,
                  boxShadow: '0 0 10px #38bdf8',
                }}
              />
              <span style={{ color: colors.white, fontSize: 15, fontWeight: 800 }}>
                SCOPE: 5.0 KM DRIVING RADIUS
              </span>
              <span style={{ color: colors.border }}>•</span>
              <span style={{ color: colors.sky, fontSize: 14, fontWeight: 700 }}>
                15 NCR HAZARDS MONITORED
              </span>
            </div>

            {/* Floating Telemetry Alert 1 - Pothole */}
            <div
              style={{
                position: 'absolute',
                top: 150,
                left: 70,
                opacity: card1Spring,
                transform: `translateX(${interpolate(card1Spring, [0, 1], [-30, 0])}px)`,
                background: 'rgba(15, 23, 42, 0.92)',
                border: '1.5px solid rgba(239, 68, 68, 0.6)',
                borderRadius: 14,
                padding: '14px 20px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 20px rgba(239, 68, 68, 0.25)',
                backdropFilter: 'blur(16px)',
                width: 320,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: colors.red,
                    boxShadow: '0 0 8px #ef4444',
                  }}
                />
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 11,
                    fontWeight: 800,
                    color: colors.red,
                    letterSpacing: 1.5,
                  }}
                >
                  CRITICAL SEVERITY
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: monoFont,
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  0.8 KM
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                Deep Pothole Detected
              </div>
              <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2, fontFamily }}>
                Taft Ave near Quirino • Wheel damage hazard
              </div>
            </div>

            {/* Floating Telemetry Alert 2 - Flood */}
            <div
              style={{
                position: 'absolute',
                top: 210,
                right: 70,
                opacity: card2Spring,
                transform: `translateX(${interpolate(card2Spring, [0, 1], [30, 0])}px)`,
                background: 'rgba(15, 23, 42, 0.92)',
                border: '1.5px solid rgba(245, 158, 11, 0.6)',
                borderRadius: 14,
                padding: '14px 20px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.25)',
                backdropFilter: 'blur(16px)',
                width: 330,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: colors.amber,
                    boxShadow: '0 0 8px #f59e0b',
                  }}
                />
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 11,
                    fontWeight: 800,
                    color: colors.amber,
                    letterSpacing: 1.5,
                  }}
                >
                  FLOOD PASSABILITY WARNING
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: monoFont,
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  2.1 KM
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                Clogged Drainage / Flood
              </div>
              <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2, fontFamily }}>
                España Blvd • Knee-deep water • Sedans impassable
              </div>
            </div>

            {/* Floating Telemetry Alert 3 - Road Obstruction */}
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                left: 70,
                opacity: card3Spring,
                transform: `translateY(${interpolate(card3Spring, [0, 1], [30, 0])}px)`,
                background: 'rgba(15, 23, 42, 0.92)',
                border: '1.5px solid rgba(56, 189, 248, 0.5)',
                borderRadius: 14,
                padding: '14px 20px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(16px)',
                width: 320,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: colors.sky,
                    boxShadow: '0 0 8px #38bdf8',
                  }}
                />
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 11,
                    fontWeight: 800,
                    color: colors.sky,
                    letterSpacing: 1.5,
                  }}
                >
                  ROAD OBSTRUCTION
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: monoFont,
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  1.4 KM
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                Fallen Branch & Debris
              </div>
              <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 2, fontFamily }}>
                EDSA Guadalupe • Lane 2 blocked
              </div>
            </div>
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="01"
        kicker="SPATIAL RADAR"
        title="Sub-Second Proximity Alerts"
        detail="Concentric radar rings scan your perimeter in real time"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 3: 15ms Instant Tap Reporting (8.0s – 13.0s | Frames 240 – 390)
// =============================================================================
const InstantReportingScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })
  const gentleZoom = interpolate(frame, [0, 150], [1.02, 1.06], { extrapolateRight: 'clamp' })

  // Cursor moves to Flooding card at frame 40, taps, then moves to Drop Hazard Trace at frame 88
  const cursorX = interpolate(frame, [15, 42, 60, 88], [225, 335, 335, 225], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const cursorY = interpolate(frame, [15, 42, 60, 88], [350, 130, 130, 452], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const tapSpring1 = spring({ frame: frame - 42, fps, config: { damping: 100, stiffness: 200 } })
  const tapSpring2 = spring({ frame: frame - 88, fps, config: { damping: 100, stiffness: 200 } })

  const isFloodingTapped = frame >= 42
  const isSubmitTapped = frame >= 88

  // Floating side cards spring
  const sideCardLeft = spring({ frame: frame - 18, fps, config: { damping: 130, stiffness: 110 } })
  const sideCardRight = spring({ frame: frame - 30, fps, config: { damping: 130, stiffness: 110 } })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar opacity={0.5} />

      <div
        style={{
          transform: `scale(${introSpring * gentleZoom})`,
          opacity: introSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Live Radar Map Underlay */}
            <Img
              src={staticFile('captures/capture-1-radar-overview.png')}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.42) contrast(1.1) blur(1.5px)',
              }}
            />

            {/* Centered Isolated Floating Modal Card */}
            <div style={{ position: 'relative', zIndex: 15 }}>
              <FloatingModalCard
                src={staticFile('captures/capture-2-report-drawer.png')}
                height={486}
                offsetY={288}
                glowColor="rgba(56, 189, 248, 0.35)"
              />

              {/* Glowing Outline over "Flooding / Drainage" Button */}
              <div
                style={{
                  position: 'absolute',
                  top: 108,
                  left: 232,
                  width: 202,
                  height: 58,
                  borderRadius: 12,
                  border: `2px solid ${isFloodingTapped ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}`,
                  boxShadow: isFloodingTapped
                    ? '0 0 25px rgba(56, 189, 248, 0.8), inset 0 0 15px rgba(56, 189, 248, 0.4)'
                    : 'none',
                  pointerEvents: 'none',
                  transition: 'all 0.15s ease-out',
                }}
              />

              {/* Glowing Outline over "Drop Hazard Trace" Button */}
              {isSubmitTapped && (
                <div
                  style={{
                    position: 'absolute',
                    top: 428,
                    left: 20,
                    width: 410,
                    height: 44,
                    borderRadius: 10,
                    border: '2px solid #10b981',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.85), inset 0 0 15px rgba(16, 185, 129, 0.5)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Animated Touch Cursor Reticle */}
              <div
                style={{
                  position: 'absolute',
                  left: cursorX,
                  top: cursorY,
                  transform: `translate(-50%, -50%) scale(${
                    1 - interpolate(tapSpring1, [0, 1], [0, 0.35]) - interpolate(tapSpring2, [0, 1], [0, 0.35])
                  })`,
                  pointerEvents: 'none',
                  zIndex: 35,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #38bdf8 0%, rgba(56, 189, 248, 0.2) 70%)',
                    border: '2.5px solid #ffffff',
                    boxShadow: '0 0 22px #38bdf8',
                  }}
                />
              </div>
            </div>

            {/* Left Telemetry Card: Precision Coordinates */}
            <div
              style={{
                position: 'absolute',
                top: 150,
                left: 70,
                opacity: sideCardLeft,
                transform: `translateX(${interpolate(sideCardLeft, [0, 1], [-30, 0])}px)`,
                background: 'rgba(8, 12, 18, 0.94)',
                border: '1.5px solid rgba(56, 189, 248, 0.55)',
                borderRadius: 16,
                padding: '18px 24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(20px)',
                width: 360,
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: colors.emerald,
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors.emerald,
                    letterSpacing: 1.5,
                  }}
                >
                  AUTONOMOUS GPS PINNING
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 18, fontWeight: 800, fontFamily }}>
                Zero Form Fatigue
              </div>
              <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, fontFamily, lineHeight: 1.4 }}>
                Pin drops instantly at your exact heading. Coordinates pre-populated from vehicle telemetry.
              </p>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: monoFont,
                  fontSize: 12,
                  color: colors.sky,
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                14.59617° N, 120.98763° E • ±2.5M
              </div>
            </div>

            {/* Right Telemetry Card: 15ms Speed Tag */}
            <div
              style={{
                position: 'absolute',
                top: 150,
                right: 70,
                opacity: sideCardRight,
                transform: `translateX(${interpolate(sideCardRight, [0, 1], [30, 0])}px)`,
                background: 'rgba(8, 12, 18, 0.94)',
                border: '1.5px solid rgba(56, 189, 248, 0.55)',
                borderRadius: 16,
                padding: '18px 24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(20px)',
                width: 360,
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: colors.sky,
                    color: colors.obsidian,
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  ⚡
                </span>
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors.sky,
                    letterSpacing: 1.5,
                  }}
                >
                  15MS DISPATCH BENCHMARK
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 18, fontWeight: 800, fontFamily }}>
                1-Tap Civic Pinning
              </div>
              <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, fontFamily, lineHeight: 1.4 }}>
                Designed for drivers and riders: report dangerous hazards in under 1 second without typing.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: 10,
                  marginTop: 10,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: colors.emerald,
                }}
              >
                <span>✓ ONE-TAP DISPATCH</span>
                <span>•</span>
                <span>0.00s DRIVER FRICTION</span>
              </div>
            </div>
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="02"
        kicker="INSTANT REPORTING"
        title="1-Tap Civic Pinning"
        detail="Log road hazards in under 15ms with automatic GPS precision"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 4: Flood Depth & Passability Consensus (13.0s – 18.0s | Frames 390 – 540)
// =============================================================================
const FloodPassabilityScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })
  const gentleZoom = interpolate(frame, [0, 150], [1.02, 1.07], { extrapolateRight: 'clamp' })

  // Split-screen inspection scan line sweeping inside the modal
  const scannerModalX = interpolate(frame, [15, 90], [30, 420], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Badges spring
  const badgeSpring1 = spring({ frame: frame - 25, fps, config: { damping: 130, stiffness: 110 } })
  const badgeSpring2 = spring({ frame: frame - 50, fps, config: { damping: 130, stiffness: 110 } })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar opacity={0.5} />

      <div
        style={{
          transform: `scale(${introSpring * gentleZoom})`,
          opacity: introSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Live Radar Map Underlay */}
            <Img
              src={staticFile('captures/capture-1-radar-overview.png')}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.42) contrast(1.1) blur(1.5px)',
              }}
            />

            {/* Centered Isolated Floating Hazard Detail Card */}
            <div style={{ position: 'relative', zIndex: 15 }}>
              <FloatingModalCard
                src={staticFile('captures/capture-3-flood-passability.png')}
                height={595}
                offsetY={244}
                glowColor="rgba(56, 189, 248, 0.35)"
              />

              {/* Animated Laser Scanning Line inside Modal */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: scannerModalX,
                  width: 2.5,
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 12px #38bdf8, 0 0 24px #0284c7',
                  pointerEvents: 'none',
                  zIndex: 25,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 8,
                    fontFamily: monoFont,
                    fontSize: 10,
                    fontWeight: 800,
                    color: colors.sky,
                    background: 'rgba(5, 7, 10, 0.9)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  SCANNER ACTIVE
                </div>
              </div>
            </div>

            {/* Overlay Badge 1: Vehicle Passability Matrix */}
            <div
              style={{
                position: 'absolute',
                top: 140,
                left: 70,
                opacity: badgeSpring1,
                transform: `translateX(${interpolate(badgeSpring1, [0, 1], [-30, 0])}px)`,
                background: 'rgba(8, 12, 18, 0.94)',
                border: '1.5px solid rgba(16, 185, 129, 0.55)',
                borderRadius: 16,
                padding: '18px 24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(20px)',
                width: 380,
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    backgroundColor: colors.emerald,
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors.emerald,
                    letterSpacing: 1.5,
                  }}
                >
                  CLEARANCE ADVISORY
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 18, fontWeight: 800, fontFamily }}>
                Depth: Knee-Deep (45 cm)
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#6ee7b7',
                    fontFamily,
                  }}
                >
                  <span>✓ PASSABLE:</span>
                  <span>SUV, Pickups & High-Clearance Buses</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fca5a5',
                    fontFamily,
                  }}
                >
                  <span>✗ IMPASSE:</span>
                  <span>Sedans, Hatchbacks & Motorcycles</span>
                </div>
              </div>
            </div>

            {/* Overlay Badge 2: Community Consensus Confidence */}
            <div
              style={{
                position: 'absolute',
                top: 140,
                right: 70,
                opacity: badgeSpring2,
                transform: `translateX(${interpolate(badgeSpring2, [0, 1], [30, 0])}px)`,
                background: 'rgba(8, 12, 18, 0.94)',
                border: '1.5px solid rgba(56, 189, 248, 0.55)',
                borderRadius: 16,
                padding: '18px 24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(20px)',
                width: 360,
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>▲</span>
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 12,
                    fontWeight: 800,
                    color: colors.sky,
                    letterSpacing: 1.5,
                  }}
                >
                  COMMUNITY CONSENSUS
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 18, fontWeight: 800, fontFamily }}>
                12 Drivers Verified
              </div>
              <div style={{ color: colors.textMuted, fontSize: 13, marginTop: 4, fontFamily }}>
                98% Confidence score • Updated 4 minutes ago by active NCR motorists
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: colors.sky,
                  background: 'rgba(56, 189, 248, 0.1)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                AUTODECAYS IN 48H IF UNCONFIRMED
              </div>
            </div>
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="03"
        kicker="CONSENSUS ENGINE"
        title="Flood Depth & Passability"
        detail="Know if your vehicle can pass before you reach the intersection"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 5: Offline First Resilience & Background Sync (18.0s – 23.0s | Frames 540 – 690)
// =============================================================================
const OfflineResilienceScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })
  const gentleZoom = interpolate(frame, [0, 150], [1.02, 1.06], { extrapolateRight: 'clamp' })

  // Stage 1: Offline (0-55f) -> Stage 2: Syncing (55-95f) -> Stage 3: Replicated (95-150f)
  const isSyncing = frame >= 50 && frame < 95
  const isDone = frame >= 95

  const syncRotation = frame * 10

  const cardSpringRight = spring({ frame: frame - 20, fps, config: { damping: 130, stiffness: 110 } })
  const cardSpringLeft = spring({ frame: frame - 35, fps, config: { damping: 130, stiffness: 110 } })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar opacity={0.5} />

      <div
        style={{
          transform: `scale(${introSpring * gentleZoom})`,
          opacity: introSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Live Radar Map Underlay */}
            <Img
              src={staticFile('captures/capture-1-radar-overview.png')}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.42) contrast(1.1) blur(1.5px)',
              }}
            />

            {/* Dynamic Status Ribbon at Top of Viewport */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: isDone
                  ? 'rgba(6, 30, 20, 0.94)'
                  : isSyncing
                  ? 'rgba(15, 23, 42, 0.94)'
                  : 'rgba(35, 18, 10, 0.94)',
                border: `1.5px solid ${
                  isDone
                    ? 'rgba(16, 185, 129, 0.6)'
                    : isSyncing
                    ? 'rgba(56, 189, 248, 0.6)'
                    : 'rgba(245, 158, 11, 0.6)'
                }`,
                borderRadius: 999,
                padding: '10px 28px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                fontFamily: monoFont,
                transition: 'all 0.3s',
                zIndex: 25,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: isDone ? colors.emerald : isSyncing ? colors.sky : colors.amber,
                  boxShadow: `0 0 10px ${isDone ? '#10b981' : isSyncing ? '#38bdf8' : '#f59e0b'}`,
                }}
              />
              <span
                style={{
                  color: colors.white,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                {isDone
                  ? 'ONLINE // SUPABASE REPLICATION COMPLETE'
                  : isSyncing
                  ? 'BACKGROUND SYNC IN PROGRESS...'
                  : 'OFFLINE MODE ENGAGED // INDEXEDDB ACTIVE'}
              </span>
            </div>

            {/* Centered Isolated Floating About / Architecture Modal Card */}
            <div style={{ position: 'relative', zIndex: 15 }}>
              <FloatingModalCard
                src={staticFile('captures/capture-5-about-modal.png')}
                height={715}
                offsetY={192}
                glowColor="rgba(56, 189, 248, 0.35)"
              />
            </div>

            {/* Left Diagnostic Telemetry Card */}
            <div
              style={{
                position: 'absolute',
                top: 140,
                left: 70,
                opacity: cardSpringLeft,
                transform: `translateX(${interpolate(cardSpringLeft, [0, 1], [-30, 0])}px)`,
                background: 'rgba(8, 12, 18, 0.94)',
                border: '1.5px solid rgba(56, 189, 248, 0.55)',
                borderRadius: 16,
                padding: '18px 24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.85), 0 0 25px rgba(56, 189, 248, 0.2)',
                backdropFilter: 'blur(20px)',
                width: 360,
                zIndex: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isDone ? colors.emerald : colors.amber,
                    boxShadow: `0 0 8px ${isDone ? '#10b981' : '#f59e0b'}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: monoFont,
                    fontSize: 12,
                    fontWeight: 800,
                    color: isDone ? colors.emerald : colors.amber,
                    letterSpacing: 1.5,
                  }}
                >
                  LOCAL PERSISTENCE ENGINE
                </span>
              </div>
              <div style={{ color: colors.white, fontSize: 18, fontWeight: 800, fontFamily }}>
                Tunnel & Dead-Zone Ready
              </div>
              <p style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, fontFamily, lineHeight: 1.4 }}>
                Full radar access and report creation even with zero cellular signal in underpasses and remote roads.
              </p>
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontFamily: monoFont,
                  fontSize: 11,
                  color: colors.sky,
                  background: 'rgba(56, 189, 248, 0.08)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <div>STORAGE: Dexie / IndexedDB 1.2MB</div>
                <div>QUEUE REPLAY: 0 dropped packets</div>
                <div>STATE: {isDone ? 'Synced with Cloud' : 'Queued Locally'}</div>
              </div>
            </div>

            {/* Right 3 Core Architecture Cards */}
            <div
              style={{
                position: 'absolute',
                top: 140,
                right: 70,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                width: 380,
                opacity: cardSpringRight,
                transform: `translateX(${interpolate(cardSpringRight, [0, 1], [30, 0])}px)`,
                zIndex: 20,
              }}
            >
              {/* Feature Card 1 */}
              <div
                style={{
                  background: 'rgba(8, 12, 18, 0.94)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>💾</span>
                  <div>
                    <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                      Zero Data Loss Local Cache
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: 13, fontFamily, marginTop: 2 }}>
                      Reports saved directly to Dexie / IndexedDB if connection drops in underground tunnels or storms.
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div
                style={{
                  background: 'rgba(8, 12, 18, 0.94)',
                  border: `1.5px solid ${isSyncing ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.12)'}`,
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 22,
                      display: 'inline-block',
                      transform: isSyncing ? `rotate(${syncRotation}deg)` : 'none',
                    }}
                  >
                    🔄
                  </span>
                  <div>
                    <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                      Auto Background Re-Sync
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: 13, fontFamily, marginTop: 2 }}>
                      Automatically dispatches queued reports to cloud Supabase the exact moment signal returns.
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div
                style={{
                  background: 'rgba(8, 12, 18, 0.94)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>📱</span>
                  <div>
                    <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                      Installable PWA Architecture
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: 13, fontFamily, marginTop: 2 }}>
                      Runs as a standalone native app on iOS & Android with screen wake-lock while driving.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="04"
        kicker="OFFLINE ARCHITECTURE"
        title="Uninterrupted Route Defense"
        detail="Reports cache locally during signal drops and sync automatically"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 6: Command Center Outro & Call to Action (23.0s – 27.0s | Frames 690 – 810)
// =============================================================================
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sweepAngle = (frame * 3) % 360

  const logoSpring = spring({ frame, fps, config: { damping: 130, stiffness: 90 } })
  const textSpring = spring({ frame: frame - 10, fps, config: { damping: 140, stiffness: 95 } })
  const pillarsSpring = spring({ frame: frame - 22, fps, config: { damping: 140, stiffness: 100 } })
  const buttonSpring = spring({ frame: frame - 36, fps, config: { damping: 140, stiffness: 100 } })

  const pillars = [
    { icon: '🎯', title: '5.0km Spatial Radar', desc: 'Sub-second proximity alerts' },
    { icon: '🌊', title: 'Flood Consensus', desc: 'Real-time vehicle passability' },
    { icon: '⚡', title: 'Offline-First PWA', desc: 'Zero data loss with auto-sync' },
  ]

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar sweepAngle={sweepAngle} opacity={0.8} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          opacity: logoSpring,
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.85, 1])}) translateY(${interpolate(logoSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div style={{ transform: `rotate(${frame * 0.25}deg)`, marginBottom: 14 }}>
          <BakasBrandMark size={130} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 92,
            fontWeight: 900,
            color: colors.white,
            margin: 0,
            letterSpacing: -2.5,
            fontFamily,
            lineHeight: 1,
            textShadow: '0 0 35px rgba(56, 189, 248, 0.4)',
          }}
        >
          Bakás
        </h1>

        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: colors.sky,
            marginTop: 8,
            marginBottom: 26,
            opacity: textSpring,
            fontFamily,
            letterSpacing: -0.5,
          }}
        >
          Urban Road Hazard Radar
        </p>

        {/* 3 Core Pillar Badges */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginBottom: 32,
            opacity: pillarsSpring,
            transform: `translateY(${interpolate(pillarsSpring, [0, 1], [18, 0])}px)`,
          }}
        >
          {pillars.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 14,
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
              }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: colors.white, fontSize: 16, fontWeight: 800, fontFamily }}>
                  {item.title}
                </div>
                <div style={{ color: colors.textMuted, fontSize: 13, fontFamily }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div
          style={{
            opacity: buttonSpring,
            transform: `translateY(${interpolate(buttonSpring, [0, 1], [12, 0])}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            color: colors.white,
            padding: '16px 48px',
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 800,
            boxShadow: '0 12px 35px rgba(56, 189, 248, 0.45)',
            fontFamily,
            cursor: 'pointer',
          }}
        >
          <span>Protect Your Route</span>
          <span style={{ fontSize: 24 }}>→</span>
        </div>

        {/* Mission Statement & Civic Tagline */}
        <div
          style={{
            opacity: buttonSpring,
            marginTop: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.textMuted,
              fontStyle: 'italic',
              fontFamily,
            }}
          >
            "Protect your route. Leave your digital trace."
          </span>

          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.textDim,
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: monoFont,
              marginTop: 4,
            }}
          >
            Open Source Civic Tech • NCR Metro Pilipinas • PWA Standalone Ready
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Root Composition (Total 810 frames = 27.0s @ 30fps)
// =============================================================================
export const BakasShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.obsidian }}>
      {/* 0.0s – 3.5s (105f): Tactical Radar Sonar Hook */}
      <Sequence durationInFrames={105} layout="absolute-fill">
        <IntroScene />
      </Sequence>

      {/* 3.5s – 8.0s (135f): Real-Time Spatial Radar & Scope Intelligence */}
      <Sequence from={105} durationInFrames={135} layout="absolute-fill">
        <SpatialRadarScene />
      </Sequence>

      {/* 8.0s – 13.0s (150f): 15ms Instant Tap Reporting */}
      <Sequence from={240} durationInFrames={150} layout="absolute-fill">
        <InstantReportingScene />
      </Sequence>

      {/* 13.0s – 18.0s (150f): Flood Depth & Passability Consensus */}
      <Sequence from={390} durationInFrames={150} layout="absolute-fill">
        <FloodPassabilityScene />
      </Sequence>

      {/* 18.0s – 23.0s (150f): Offline Resilience & Background Sync */}
      <Sequence from={540} durationInFrames={150} layout="absolute-fill">
        <OfflineResilienceScene />
      </Sequence>

      {/* 23.0s – 27.0s (120f): Command Center Outro & Call to Action */}
      <Sequence from={690} durationInFrames={120} layout="absolute-fill">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  )
}
