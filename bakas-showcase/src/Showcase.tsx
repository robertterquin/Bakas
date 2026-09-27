import React from 'react'
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import {
  BackgroundSonar,
  BakasBrandMark,
  colors,
  fontFamily,
  monoFont,
} from './scenes/shared'

// =============================================================================
// Split-Column Feature Slide (Hapag Format: Alternating Left / Right)
// =============================================================================
const SplitSlideScene: React.FC<{
  kicker: string
  headline: string
  body: string
  capture: string
  cardSide?: 'right' | 'left'
  kickerColor?: string
}> = ({
  kicker,
  headline,
  body,
  capture,
  cardSide = 'right',
  kickerColor = colors.sky,
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  // Smooth entrance & exit interpolation for seamless slide flow
  const enterOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  const slideOpacity = enterOpacity * exitOpacity

  const textTranslate = interpolate(frame, [0, 16], [cardSide === 'right' ? -22 : 22, 0], {
    extrapolateRight: 'clamp',
  })

  const cardTranslate = interpolate(frame, [2, 18], [cardSide === 'right' ? 26 : -26, 0], {
    extrapolateRight: 'clamp',
  })

  // Subtle breathing float on card
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.03], {
    extrapolateRight: 'clamp',
  })

  const textContent = (
    <div
      style={{
        flex: '1 1 50%',
        maxWidth: 640,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: slideOpacity,
        transform: `translateX(${textTranslate}px)`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          color: kickerColor,
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: 2.4,
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: monoFont,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: kickerColor,
            boxShadow: `0 0 10px ${kickerColor}`,
          }}
        />
        <span>{kicker}</span>
      </div>

      <h2
        style={{
          fontSize: 58,
          fontWeight: 900,
          color: colors.white,
          lineHeight: 1.12,
          letterSpacing: -1.8,
          margin: 0,
          marginBottom: 20,
          fontFamily,
        }}
      >
        {headline}
      </h2>

      <p
        style={{
          fontSize: 24,
          fontWeight: 450,
          color: colors.textMuted,
          lineHeight: 1.5,
          margin: 0,
          fontFamily,
        }}
      >
        {body}
      </p>
    </div>
  )

  const cardContent = (
    <div
      style={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: cardSide === 'right' ? 'flex-end' : 'flex-start',
        opacity: slideOpacity,
        transform: `translateX(${cardTranslate}px)`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 580,
          height: 760,
          borderRadius: 30,
          overflow: 'hidden',
          backgroundColor: colors.dark,
          border: '1.5px solid rgba(56, 189, 248, 0.28)',
          boxShadow:
            '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          position: 'relative',
        }}
      >
        <Img
          src={staticFile(`captures/${capture}`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  )

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 160px',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar sweepAngle={frame * 2.5} opacity={0.6} />
      {cardSide === 'right' ? (
        <>
          {textContent}
          {cardContent}
        </>
      ) : (
        <>
          {cardContent}
          {textContent}
        </>
      )}
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 1: Natural Brand Intro (0.0s – 3.0s | Frames 0 – 90)
// =============================================================================
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const exitOpacity = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const translateY = interpolate(frame, [0, 18], [16, 0], { extrapolateRight: 'clamp' })
  const subOpacity = interpolate(frame, [8, 20], [0, 1], { extrapolateRight: 'clamp' })
  const finalOpacity = opacity * exitOpacity

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
      <BackgroundSonar sweepAngle={frame * 3} opacity={0.7 * exitOpacity} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: finalOpacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 10,
        }}
      >
        <div style={{ transform: `rotate(${frame * 0.25}deg)` }}>
          <BakasBrandMark size={110} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: colors.white,
            marginTop: 20,
            marginBottom: 0,
            letterSpacing: -2,
            fontFamily,
          }}
        >
          Bakás
        </h1>

        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: colors.sky,
            marginTop: 10,
            marginBottom: 6,
            fontFamily,
          }}
        >
          Urban Road Hazard Radar
        </p>
      </div>

      <div
        style={{
          opacity: subOpacity,
          textAlign: 'center',
          marginTop: 12,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: colors.textMuted,
            background: 'rgba(56, 189, 248, 0.06)',
            padding: '8px 24px',
            borderRadius: 999,
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontFamily,
          }}
        >
          Real-time spatial alerts and route defense for Philippine roads
        </span>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 7: Natural Brand Outro (24.5s – 27.0s | Frames 735 – 810)
// =============================================================================
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(frame, [0, 16], [14, 0], { extrapolateRight: 'clamp' })
  const buttonOpacity = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' })

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
      <BackgroundSonar sweepAngle={frame * 3} opacity={0.7} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 10,
        }}
      >
        <div style={{ transform: `rotate(${frame * 0.25}deg)` }}>
          <BakasBrandMark size={100} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 78,
            fontWeight: 900,
            color: colors.white,
            marginTop: 16,
            marginBottom: 0,
            letterSpacing: -2,
            fontFamily,
          }}
        >
          Bakás
        </h1>

        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: colors.textMuted,
            marginTop: 8,
            marginBottom: 28,
            fontFamily,
          }}
        >
          &ldquo;Protect your route. Leave your digital trace.&rdquo;
        </p>

        <div
          style={{
            opacity: buttonOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: colors.white,
            padding: '16px 42px',
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 700,
            boxShadow:
              '0 10px 30px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            fontFamily,
          }}
        >
          <span>Launch Road Radar</span>
          <span style={{ fontSize: 24 }}>→</span>
        </div>

        <span
          style={{
            opacity: buttonOpacity,
            fontSize: 14,
            fontWeight: 700,
            color: colors.textDim,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            marginTop: 26,
            fontFamily: monoFont,
          }}
        >
          CIVIC ROUTE TELEMETRY • NCR METRO PILIPINAS • OPEN SOURCE
        </span>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Master Composition: 810 frames @ 30fps (27.0 seconds)
// Hapag Format: Intro -> Slide 1 (Right) -> Slide 2 (Left) -> Slide 3 (Right)
//                    -> Slide 4 (Left) -> Slide 5 (Right) -> Outro
// =============================================================================
export const BakasShowcase: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 0.0s – 3.0s (90f): Brand Intro Hook */}
      <Sequence durationInFrames={90} layout="absolute-fill">
        <IntroScene />
      </Sequence>

      {/* 3.0s – 7.5s (135f): Slide 1 - Spatial Radar Map (Left Text, Right Card) */}
      <Sequence from={90} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="SPATIAL RADAR"
          headline="Find what's reported nearby."
          body="Concentric radar rings scan your driving perimeter in real time, alerting you to active hazards across Metro Manila."
          capture="capture-1-radar-overview.png"
          kickerColor={colors.sky}
        />
      </Sequence>

      {/* 7.5s – 12.0s (135f): Slide 2 - 1-Tap Hazard Pinning (Left Card, Right Text) */}
      <Sequence from={225} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="left"
          kicker="REPORT IN SECONDS"
          headline="Pin road hazards in 1 tap."
          body="Drop hazard traces for open manholes, floodwaters, or dark unlit roads in under 15ms with automatic GPS precision."
          capture="capture-2-report-drawer.png"
          kickerColor={colors.amber}
        />
      </Sequence>

      {/* 12.0s – 16.5s (135f): Slide 3 - Ground-Truth Verification (Left Text, Right Card) */}
      <Sequence from={360} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="GROUND-TRUTH CONSENSUS"
          headline="Verify repairs with split sliders."
          body="Before-and-after resolution verification sliders allow the commuter community to vouch for fixed roads and clear ghost markers."
          capture="capture-3-flood-passability.png"
          kickerColor={colors.emerald}
        />
      </Sequence>

      {/* 16.5s – 21.0s (135f): Slide 4 - Corridor Navigation (Left Card, Right Text) */}
      <Sequence from={495} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="left"
          kicker="COMMAND PALETTE"
          headline="Jump to any Philippine artery."
          body="Instant search for EDSA, Commonwealth, C-5, Aguinaldo, or España with real-time distance and zero tile latency."
          capture="capture-4-search-modal.png"
          kickerColor={colors.sky}
        />
      </Sequence>

      {/* 21.0s – 24.5s (105f): Slide 5 - Offline-First Resilience (Left Text, Right Card) */}
      <Sequence from={630} durationInFrames={105} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="OFFLINE RESILIENCE"
          headline="Zero data loss in dead zones."
          body="IndexedDB caches local hazard traces when driving through underpasses or tunnels, then auto-syncs with Supabase."
          capture="capture-5-about-modal.png"
          kickerColor={colors.cyan}
        />
      </Sequence>

      {/* 24.5s – 27.0s (75f): Closing Outro */}
      <Sequence from={735} durationInFrames={75} layout="absolute-fill">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  )
}
