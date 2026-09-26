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

// =============================================================================
// Scene 1: System Debut & Radar Canvas (0.0s – 4.0s | Frames 0 – 120)
// Uses ACTUAL screen: capture-1-radar-overview.png
// =============================================================================
const SystemDebutScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sweepAngle = (frame * 4) % 360

  // Frame spring
  const frameSpring = spring({ frame, fps, config: { damping: 140, stiffness: 95 } })
  const cameraScale = interpolate(frame, [0, 120], [1.0, 1.05], { extrapolateRight: 'clamp' })

  // Overlay card (visible at start, dissolves smoothly around frame 60)
  const overlayOpacity = interpolate(frame, [50, 75], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const overlaySpring = spring({ frame, fps, config: { damping: 130, stiffness: 90 } })

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

      {/* Actual System Screen inside Tactical Frame */}
      <div
        style={{
          transform: `scale(${frameSpring * cameraScale})`,
          opacity: frameSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <Img
              src={staticFile('captures/capture-1-radar-overview.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.97) contrast(1.04)',
              }}
            />

            {/* Initial Debut Branding Card (dissolves to unveil live map) */}
            {overlayOpacity > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  backgroundColor: `rgba(4, 4, 6, ${0.85 * overlayOpacity})`,
                  backdropFilter: `blur(${16 * overlayOpacity}px)`,
                  opacity: overlayOpacity,
                  zIndex: 25,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: `scale(${interpolate(overlaySpring, [0, 1], [0.88, 1])}) translateY(${interpolate(
                      overlaySpring,
                      [0, 1],
                      [20, 0]
                    )}px)`,
                  }}
                >
                  <div style={{ transform: `rotate(${frame * 0.3}deg)`, marginBottom: 16 }}>
                    <BakasBrandMark size={110} withGlow={true} />
                  </div>

                  <div
                    style={{
                      fontFamily: monoFont,
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.sky,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    CIVIC TELEMETRY // ROUTE DEFENSE
                  </div>

                  <h1
                    style={{
                      fontSize: 84,
                      fontWeight: 900,
                      color: colors.white,
                      margin: 0,
                      letterSpacing: -2.5,
                      fontFamily,
                      lineHeight: 1,
                    }}
                  >
                    Bakás
                  </h1>

                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: colors.sky,
                      marginTop: 8,
                      marginBottom: 12,
                      fontFamily,
                    }}
                  >
                    Urban Road Hazard Radar
                  </p>

                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: colors.textMuted,
                      margin: '0 0 20px 0',
                      fontFamily,
                    }}
                  >
                    Real-time spatial alerts and community route defense for Philippine roads
                  </p>

                  {/* Clean Status Indicator (Zero emojis) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: 999,
                      padding: '8px 20px',
                      fontFamily: monoFont,
                      fontSize: 13,
                      color: colors.white,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: colors.emerald,
                        boxShadow: '0 0 8px #10b981',
                      }}
                    />
                    <span style={{ fontWeight: 700, color: colors.emerald }}>GPS ACTIVE</span>
                    <span style={{ color: colors.border }}>|</span>
                    <span style={{ color: colors.textMuted }}>14.5995° N, 120.9842° E</span>
                    <span style={{ color: colors.border }}>|</span>
                    <span style={{ color: colors.sky }}>MANILA METRO</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="01"
        kicker="CIVIC TELEMETRY"
        title="Urban Road Hazard Radar"
        detail="Real-time spatial alerts and route defense for Philippine roads"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 2: Real-Time Spatial Radar & Scope HUD (4.0s – 8.5s | Frames 120 – 255)
// Uses ACTUAL screen: capture-1-radar-overview.png
// =============================================================================
const SpatialRadarScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sweepAngle = (frame * 5) % 360

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })

    // Smooth cinematic push-in toward the active driver radar beacon
    const cameraScale = interpolate(frame, [0, 135], [1.0, 1.20], { extrapolateRight: 'clamp' })
    const cameraY = interpolate(frame, [0, 135], [0, -20], { extrapolateRight: 'clamp' })

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

        <div
          style={{
            transform: `scale(${introSpring})`,
            opacity: introSpring,
            zIndex: 10,
          }}
        >
          <TacticalFrame width={1540} height={860}>
            <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              {/* The Actual Running Bakas Radar Screen - Smooth Zoom on Radar Proximity */}
              <Img
                src={staticFile('captures/capture-1-radar-overview.png')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
                  transformOrigin: '50% 52%',
                  filter: 'brightness(0.98) contrast(1.05)',
                }}
              />
            </div>
          </TacticalFrame>
        </div>

      <GlassCaption
        badgeNumber="02"
        kicker="SPATIAL RADAR"
        title="Sub-Second Proximity Alerts"
        detail="Concentric radar rings scan your driving perimeter in real time"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 3: 1-Tap Civic Hazard Pinning (8.5s – 13.0s | Frames 255 – 390)
// Uses ACTUAL screen: capture-2-report-drawer.png
// =============================================================================
const InstantReportingScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })

  // Gentle camera zoom into the real report modal
  const cameraScale = interpolate(frame, [0, 135], [1.02, 1.09], { extrapolateRight: 'clamp' })
  const cameraY = interpolate(frame, [0, 135], [0, -10], { extrapolateRight: 'clamp' })


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
          transform: `scale(${introSpring})`,
          opacity: introSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* The Actual Running Bakas Report Drawer Screen */}
            <Img
              src={staticFile('captures/capture-2-report-drawer.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
                transformOrigin: '50% 50%',
                filter: 'brightness(0.98) contrast(1.04)',
              }}
            />
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="03"
        kicker="INSTANT REPORTING"
        title="1-Tap Civic Pinning"
        detail="Log road hazards in under 15ms with automatic GPS precision"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 4: Ground-Truth Resolution Verification (13.0s – 17.5s | Frames 390 – 525)
// Uses ACTUAL screen: capture-3-flood-passability.png
// =============================================================================
const ResolutionSliderScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })

  // Gentle camera drift
  const cameraScale = interpolate(frame, [0, 135], [1.02, 1.09], { extrapolateRight: 'clamp' })
  const cameraY = interpolate(frame, [0, 135], [0, -12], { extrapolateRight: 'clamp' })

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
          transform: `scale(${introSpring})`,
          opacity: introSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* The Actual Running Bakas Hazard Details & Resolution Slider Screen */}
            <Img
              src={staticFile('captures/capture-3-flood-passability.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
                transformOrigin: '50% 50%',
                filter: 'brightness(0.98) contrast(1.04)',
              }}
            />
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="04"
        kicker="GROUND-TRUTH CONSENSUS"
        title="Resolution Verification Slider"
        detail="Community vouches and before-and-after sliders verify road repairs"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 5: Instant Corridor Search (17.5s – 22.0s | Frames 525 – 660)
// Uses ACTUAL screen: capture-4-search-modal.png
// =============================================================================
const CorridorSearchScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })

  // Camera focus on the popular corridors list
  const cameraScale = interpolate(frame, [0, 135], [1.03, 1.12], { extrapolateRight: 'clamp' })
  const cameraY = interpolate(frame, [0, 135], [0, -8], { extrapolateRight: 'clamp' })


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
          transform: `scale(${introSpring})`,
          opacity: introSpring,
          zIndex: 10,
        }}
      >
        <TacticalFrame width={1540} height={860}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* The Actual Running Bakas Search Palette Screen */}
            <Img
              src={staticFile('captures/capture-4-search-modal.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
                transformOrigin: '50% 50%',
                filter: 'brightness(0.98) contrast(1.04)',
              }}
            />
          </div>
        </TacticalFrame>
      </div>

      <GlassCaption
        badgeNumber="05"
        kicker="COMMAND PALETTE"
        title="Instant Corridor Search"
        detail="Jump to any Philippine artery or barangay with zero tile latency"
        align="left"
      />
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 6: Architecture, Privacy & Outro (22.0s – 27.0s | Frames 660 – 810)
// Uses ACTUAL screen: capture-5-about-modal.png + Clean Closing Brand Frame
// =============================================================================
const ArchitectureOutroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const sweepAngle = (frame * 3) % 360

  // Phase 1: Actual System Architecture Screen (frames 0 to 65)
  // Phase 2: Clean Closing Brand Frame (frames 65 to 150)
  const isOutroPhase = frame >= 65

  const introSpring = spring({ frame, fps, config: { damping: 140, stiffness: 100 } })
  const outroSpring = spring({ frame: frame - 65, fps, config: { damping: 130, stiffness: 95 } })

  const brandScale = interpolate(outroSpring, [0, 1], [0.9, 1])

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
      <BackgroundSonar sweepAngle={sweepAngle} opacity={0.7} />

      {!isOutroPhase ? (
        // Phase 1: Real About & Offline-First Screen from the Actual System
        <>
          <div
            style={{
              transform: `scale(${introSpring})`,
              opacity: introSpring,
              zIndex: 10,
            }}
          >
            <TacticalFrame width={1540} height={860}>
              <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <Img
                  src={staticFile('captures/capture-5-about-modal.png')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.98) contrast(1.04)',
                  }}
                />
              </div>
            </TacticalFrame>
          </div>

          <GlassCaption
            badgeNumber="06"
            kicker="OFFLINE-FIRST ARCHITECTURE"
            title="Zero Data Loss Resilience"
            detail="IndexedDB caches local reports and syncs automatically with Supabase"
            align="left"
          />
        </>
      ) : (
        // Phase 2: Understated, Minimalist Closing Brand Frame (Zero emojis)
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            opacity: outroSpring,
            transform: `scale(${brandScale}) translateY(${interpolate(outroSpring, [0, 1], [18, 0])}px)`,
          }}
        >
          <div style={{ transform: `rotate(${frame * 0.2}deg)`, marginBottom: 14 }}>
            <BakasBrandMark size={118} withGlow={true} />
          </div>

          <h1
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: colors.white,
              margin: 0,
              letterSpacing: -2.5,
              fontFamily,
              lineHeight: 1,
            }}
          >
            Bakás
          </h1>

          <p
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: colors.sky,
              marginTop: 8,
              marginBottom: 28,
              fontFamily,
              letterSpacing: -0.5,
            }}
          >
            Urban Road Hazard Radar
          </p>

          {/* 3 Clean Typographic Pillar Badges (NO EMOJIS) */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 30,
            }}
          >
            {['SPATIAL RADAR', 'COMMUNITY CONSENSUS', 'OFFLINE-FIRST PWA'].map((title, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 999,
                  padding: '10px 22px',
                  fontFamily: monoFont,
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.white,
                  letterSpacing: 1.5,
                }}
              >
                {title}
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: colors.white,
              padding: '15px 44px',
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 800,
              boxShadow: '0 10px 30px rgba(56, 189, 248, 0.4)',
              fontFamily,
              cursor: 'pointer',
            }}
          >
            <span>Launch Road Radar</span>
            <span style={{ fontSize: 22 }}>→</span>
          </div>

          {/* Civic Tagline */}
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 17,
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
                fontSize: 12,
                fontWeight: 700,
                color: colors.textDim,
                letterSpacing: 2,
                textTransform: 'uppercase',
                fontFamily: monoFont,
                marginTop: 4,
              }}
            >
              Open Source Civic Tech • NCR Metro Pilipinas • Next.js & Supabase
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  )
}

// =============================================================================
// Root Composition (Total 810 frames = 27.0s @ 30fps)
// =============================================================================
export const BakasShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.obsidian }}>
      {/* 0.0s – 4.0s (120f): System Debut & Radar Canvas */}
      <Sequence durationInFrames={120} layout="absolute-fill">
        <SystemDebutScene />
      </Sequence>

      {/* 4.0s – 8.5s (135f): Real-Time Spatial Radar & Scope HUD */}
      <Sequence from={120} durationInFrames={135} layout="absolute-fill">
        <SpatialRadarScene />
      </Sequence>

      {/* 8.5s – 13.0s (135f): 1-Tap Civic Hazard Pinning */}
      <Sequence from={255} durationInFrames={135} layout="absolute-fill">
        <InstantReportingScene />
      </Sequence>

      {/* 13.0s – 17.5s (135f): Ground-Truth Resolution Verification */}
      <Sequence from={390} durationInFrames={135} layout="absolute-fill">
        <ResolutionSliderScene />
      </Sequence>

      {/* 17.5s – 22.0s (135f): Instant Corridor Search */}
      <Sequence from={525} durationInFrames={135} layout="absolute-fill">
        <CorridorSearchScene />
      </Sequence>

      {/* 22.0s – 27.0s (150f): Architecture, Privacy & Outro */}
      <Sequence from={660} durationInFrames={150} layout="absolute-fill">
        <ArchitectureOutroScene />
      </Sequence>
    </AbsoluteFill>
  )
}
