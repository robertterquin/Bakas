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
import {
  InteractiveSlide1Overlay,
  InteractiveSlide2Overlay,
  InteractiveSlide3Overlay,
  InteractiveSlide4Overlay,
  InteractiveSlide5Overlay,
} from './scenes/InteractiveOverlay'

// =============================================================================
// Split-Column Feature Slide (Hapag Layout: Alternating Left / Right)
// Natural Human-Made Design: concise text, relaxed rhythm, authentic UI
// =============================================================================
const SplitSlideScene: React.FC<{
  kicker: string
  headline: string
  body: string
  capture: string
  cardSide?: 'right' | 'left'
  kickerColor?: string
  cardWidth?: number
  cardHeight?: number
  fit?: 'cover' | 'contain'
  overlay?: React.ReactNode
}> = ({
  kicker,
  headline,
  body,
  capture,
  cardSide = 'right',
  kickerColor = colors.sky,
  cardWidth = 880,
  cardHeight = 840,
  fit = 'contain',
  overlay,
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

  const textTranslate = interpolate(frame, [0, 16], [cardSide === 'right' ? -24 : 24, 0], {
    extrapolateRight: 'clamp',
  })

  const cardTranslate = interpolate(frame, [2, 18], [cardSide === 'right' ? 24 : -24, 0], {
    extrapolateRight: 'clamp',
  })

  // Subtle breathing float on card
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.02], {
    extrapolateRight: 'clamp',
  })

  const textContent = (
    <div
      style={{
        flex: '0 0 540px',
        maxWidth: 540,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: slideOpacity,
        transform: `translateX(${textTranslate}px)`,
        zIndex: 10,
      }}
    >
      {/* Category Kicker */}
      <div
        style={{
          color: kickerColor,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: 2.5,
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

      {/* Main Headline */}
      <h2
        style={{
          fontSize: 54,
          fontWeight: 800,
          color: colors.white,
          lineHeight: 1.15,
          letterSpacing: -1.5,
          margin: 0,
          marginBottom: 18,
          fontFamily,
        }}
      >
        {headline}
      </h2>

      {/* Short, Natural Human Body Text */}
      <p
        style={{
          fontSize: 22,
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.68)',
          lineHeight: 1.55,
          margin: 0,
          maxWidth: 500,
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
      {fit === 'cover' ? (
        <div
          style={{
            position: 'relative',
            width: cardWidth,
            height: cardHeight,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 28,
              overflow: 'hidden',
              backgroundColor: colors.dark,
              border: '1.5px solid rgba(56, 189, 248, 0.25)',
              boxShadow:
                '0 28px 70px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
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
          {overlay}
        </div>
      ) : (
        <div
          style={{
            display: 'inline-flex',
            position: 'relative',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <div
            style={{
              borderRadius: 26,
              overflow: 'hidden',
              border: '1.5px solid rgba(56, 189, 248, 0.25)',
              boxShadow:
                '0 28px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              backgroundColor: '#0a0f1d',
            }}
          >
            <Img
              src={staticFile(`captures/${capture}`)}
              style={{
                height: cardHeight,
                width: 'auto',
                maxWidth: cardWidth,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          {overlay}
        </div>
      )}
    </div>
  )

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 90,
        padding: '0 80px',
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
// Clean, minimal, human-made
// =============================================================================
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const exitOpacity = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const translateY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: 'clamp' })
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
      <BackgroundSonar sweepAngle={frame * 2.5} opacity={0.65 * exitOpacity} />
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
          <BakasBrandMark size={104} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 82,
            fontWeight: 900,
            color: colors.white,
            marginTop: 18,
            marginBottom: 0,
            letterSpacing: -2,
            fontFamily,
          }}
        >
          Bakas
        </h1>

        <p
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: colors.sky,
            marginTop: 8,
            marginBottom: 10,
            fontFamily,
          }}
        >
          Road Hazard Radar
        </p>

        <p
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.62)',
            margin: 0,
            opacity: subOpacity,
            fontFamily,
          }}
        >
          Live road hazard alerts for Philippine streets
        </p>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 7: Natural Brand Outro (24.5s – 27.0s | Frames 735 – 810)
// Simple, authentic, minimal brand lockup
// =============================================================================
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(frame, [0, 16], [14, 0], { extrapolateRight: 'clamp' })
  const subOpacity = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' })

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
      <BackgroundSonar sweepAngle={frame * 2.5} opacity={0.65} />
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
          <BakasBrandMark size={96} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 76,
            fontWeight: 900,
            color: colors.white,
            marginTop: 16,
            marginBottom: 0,
            letterSpacing: -2,
            fontFamily,
          }}
        >
          Bakas
        </h1>

        <p
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.72)',
            marginTop: 8,
            marginBottom: 24,
            fontFamily,
          }}
        >
          Community Road Safety Radar
        </p>

        {/* GitHub Repository Badge */}
        <div
          style={{
            opacity: subOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '12px 28px',
            borderRadius: 999,
            boxShadow:
              '0 12px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.sky}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: monoFont,
              letterSpacing: 1.5,
              color: colors.sky,
            }}
          >
            robertterquin / Bakas
          </span>
        </div>

        <span
          style={{
            opacity: subOpacity,
            fontSize: 13,
            fontWeight: 600,
            color: colors.textDim,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            marginTop: 24,
            fontFamily: monoFont,
          }}
        >
          Zero Login • Offline First • Open Source Civic Radar
        </span>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Master Composition: 810 frames @ 30fps (27.0 seconds)
// Hapag Format with Natural Human-Written Copy & Clean Visual Rhythm
// =============================================================================
export const BakasShowcase: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 0.0s – 3.0s (90f): Brand Intro Hook */}
      <Sequence durationInFrames={90} layout="absolute-fill">
        <IntroScene />
      </Sequence>

      {/* 3.0s – 7.5s (135f): Slide 1 - Radar Map (Left Text, Right Card) */}
      <Sequence from={90} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="RADAR OVERVIEW"
          headline="Real-time road hazard radar."
          body="Track potholes, flash floods, and dark streets across Metro Manila with live GPS telemetry."
          capture="capture-1-radar-overview.png"
          kickerColor={colors.sky}
          cardWidth={1040}
          cardHeight={860}
          fit="cover"
          overlay={<InteractiveSlide1Overlay />}
        />
      </Sequence>

      {/* 7.5s – 12.0s (135f): Slide 2 - 1-Tap Pinning (Left Card, Right Text) */}
      <Sequence from={225} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="left"
          kicker="INSTANT REPORTING"
          headline="Pin hazards in two taps."
          body="Drop a pinpoint trace for flooded roads, manholes, or obstructions. No account or sign-up needed."
          capture="capture-2-report-drawer.png"
          kickerColor={colors.amber}
          cardWidth={920}
          cardHeight={860}
          fit="contain"
          overlay={<InteractiveSlide2Overlay />}
        />
      </Sequence>

      {/* 12.0s – 16.5s (135f): Slide 3 - Resolution & TTL (Left Text, Right Card) */}
      <Sequence from={360} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="DYNAMIC TTL & PASSABILITY"
          headline="Community-verified road status."
          body="Vote on flood depth passability for SUVs and cars. Community vouches extend TTL timers in real time."
          capture="capture-3-flood-passability.png"
          kickerColor={colors.emerald}
          cardWidth={920}
          cardHeight={860}
          fit="contain"
          overlay={<InteractiveSlide3Overlay />}
        />
      </Sequence>

      {/* 16.5s – 21.0s (135f): Slide 4 - Route Search (Left Card, Right Text) */}
      <Sequence from={495} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="left"
          kicker="CORRIDOR SEARCH"
          headline="Instant major route status."
          body="Quick-check conditions along EDSA, C-5, Commonwealth, and key Philippine commuting arteries."
          capture="capture-4-search-modal.png"
          kickerColor={colors.sky}
          cardWidth={1000}
          cardHeight={720}
          fit="contain"
          overlay={<InteractiveSlide4Overlay />}
        />
      </Sequence>

      {/* 21.0s – 24.5s (105f): Slide 5 - Offline Ready (Left Text, Right Card) */}
      <Sequence from={630} durationInFrames={105} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="OFFLINE FIRST"
          headline="Zero signal? Still works."
          body="Local IndexedDB caching stores reports in tunnels and dead zones, automatically syncing when reconnected."
          capture="capture-5-about-modal.png"
          kickerColor={colors.cyan}
          cardWidth={560}
          cardHeight={860}
          fit="contain"
          overlay={<InteractiveSlide5Overlay />}
        />
      </Sequence>

      {/* 24.5s – 27.0s (75f): Closing Outro */}
      <Sequence from={735} durationInFrames={75} layout="absolute-fill">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  )
}
