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

  const textTranslate = interpolate(frame, [0, 16], [cardSide === 'right' ? -20 : 20, 0], {
    extrapolateRight: 'clamp',
  })

  const cardTranslate = interpolate(frame, [2, 18], [cardSide === 'right' ? 24 : -24, 0], {
    extrapolateRight: 'clamp',
  })

  // Subtle breathing float on card
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.025], {
    extrapolateRight: 'clamp',
  })

  const textContent = (
    <div
      style={{
        flex: '1 1 50%',
        maxWidth: 580,
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
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 14,
          fontFamily: monoFont,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: kickerColor,
            boxShadow: `0 0 8px ${kickerColor}`,
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
          marginBottom: 16,
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
          color: 'rgba(255, 255, 255, 0.65)',
          lineHeight: 1.55,
          margin: 0,
          maxWidth: 480,
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
          borderRadius: 28,
          overflow: 'hidden',
          backgroundColor: colors.dark,
          border: '1.5px solid rgba(56, 189, 248, 0.24)',
          boxShadow:
            '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
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
          Live road hazard alerts for Philippine drivers
        </p>
      </div>
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 7: Natural Brand Outro (24.5s – 27.0s | Frames 735 – 810)
// Simple, elegant, clear call to action
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
            marginBottom: 26,
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
            padding: '15px 38px',
            borderRadius: 999,
            fontSize: 21,
            fontWeight: 700,
            boxShadow:
              '0 10px 30px rgba(56, 189, 248, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
            fontFamily,
          }}
        >
          <span>Open Road Radar</span>
          <span style={{ fontSize: 22 }}>→</span>
        </div>

        <span
          style={{
            opacity: buttonOpacity,
            fontSize: 13,
            fontWeight: 600,
            color: colors.textDim,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginTop: 24,
            fontFamily: monoFont,
          }}
        >
          Free &amp; Open Source • Built for Philippine Roads
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
          kicker="RADAR MAP"
          headline="See hazards reported nearby."
          body="Live community alerts for potholes, floods, and road hazards along your route."
          capture="capture-1-radar-overview.png"
          kickerColor={colors.sky}
        />
      </Sequence>

      {/* 7.5s – 12.0s (135f): Slide 2 - 1-Tap Pinning (Left Card, Right Text) */}
      <Sequence from={225} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="left"
          kicker="QUICK REPORT"
          headline="Report hazards in one tap."
          body="Pin potholes, flooded streets, or obstacles in seconds. No login required."
          capture="capture-2-report-drawer.png"
          kickerColor={colors.amber}
        />
      </Sequence>

      {/* 12.0s – 16.5s (135f): Slide 3 - Resolution Verification (Left Text, Right Card) */}
      <Sequence from={360} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="COMMUNITY VERIFIED"
          headline="Confirm when roads are fixed."
          body="Compare before-and-after photos and vote with fellow drivers to clear resolved reports."
          capture="capture-3-flood-passability.png"
          kickerColor={colors.emerald}
        />
      </Sequence>

      {/* 16.5s – 21.0s (135f): Slide 4 - Route Search (Left Card, Right Text) */}
      <Sequence from={495} durationInFrames={135} layout="absolute-fill">
        <SplitSlideScene
          cardSide="left"
          kicker="FAST SEARCH"
          headline="Check major routes instantly."
          body="Search EDSA, C-5, Commonwealth, and major roads to see current hazards."
          capture="capture-4-search-modal.png"
          kickerColor={colors.sky}
        />
      </Sequence>

      {/* 21.0s – 24.5s (105f): Slide 5 - Offline Ready (Left Text, Right Card) */}
      <Sequence from={630} durationInFrames={105} layout="absolute-fill">
        <SplitSlideScene
          cardSide="right"
          kicker="OFFLINE READY"
          headline="Works even without signal."
          body="Saves reports offline in tunnels and dead zones, then syncs automatically."
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
