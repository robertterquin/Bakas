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
// Portrait Feature Slide (1080x1920 - 9:16 Mobile & Social Optimized)
// Natural Human-Made Design: clear upper copy + prominent lower mobile viewport
// =============================================================================
const PortraitSlideScene: React.FC<{
  kicker: string
  headline: string
  body: string
  capture: string
  kickerColor?: string
  enterDirection?: 'up' | 'left' | 'right'
}> = ({
  kicker,
  headline,
  body,
  capture,
  kickerColor = colors.sky,
  enterDirection = 'up',
}) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // Smooth entrance & exit crossfades
  const enterOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  const slideOpacity = enterOpacity * exitOpacity

  // Dynamic entrance easing based on alternating direction
  const cardTranslateY =
    enterDirection === 'up'
      ? interpolate(frame, [0, 18], [36, 0], { extrapolateRight: 'clamp' })
      : 0

  const cardTranslateX =
    enterDirection === 'left'
      ? interpolate(frame, [0, 18], [-28, 0], { extrapolateRight: 'clamp' })
      : enterDirection === 'right'
      ? interpolate(frame, [0, 18], [28, 0], { extrapolateRight: 'clamp' })
      : 0

  const textTranslateY = interpolate(frame, [0, 16], [-16, 0], {
    extrapolateRight: 'clamp',
  })

  // Subtle breathing zoom on card
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.025], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.obsidian,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '140px 76px 120px 76px',
        overflow: 'hidden',
      }}
    >
      <BackgroundSonar sweepAngle={frame * 2.5} opacity={0.65} size={2100} />

      {/* Upper Section: Clean Natural Human Copy */}
      <div
        style={{
          width: '100%',
          maxWidth: 928,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          opacity: slideOpacity,
          transform: `translateY(${textTranslateY}px)`,
          zIndex: 10,
        }}
      >
        {/* Kicker Badge */}
        <div
          style={{
            color: kickerColor,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            marginBottom: 14,
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
            fontSize: 56,
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

        {/* Short, Conversational Body Text */}
        <p
          style={{
            fontSize: 25,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.68)',
            lineHeight: 1.5,
            margin: 0,
            maxWidth: 880,
            fontFamily,
          }}
        >
          {body}
        </p>
      </div>

      {/* Lower Section: Prominent Floating Mobile Viewport Card */}
      <div
        style={{
          width: 890,
          height: 1160,
          borderRadius: 36,
          overflow: 'hidden',
          backgroundColor: colors.dark,
          border: `1.5px solid ${kickerColor}40`,
          boxShadow: `0 30px 80px rgba(0, 0, 0, 0.92), 0 0 35px ${kickerColor}18, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
          position: 'relative',
          opacity: slideOpacity,
          transform: `translate(${cardTranslateX}px, ${cardTranslateY}px)`,
          zIndex: 10,
          flexShrink: 0,
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
    </AbsoluteFill>
  )
}

// =============================================================================
// Scene 1: Portrait Brand Intro (0.0s – 3.0s | Frames 0 – 90)
// Clean, minimal, human-made
// =============================================================================
const PortraitIntroScene: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })
  const exitOpacity = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const translateY = interpolate(frame, [0, 18], [20, 0], { extrapolateRight: 'clamp' })
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
      <BackgroundSonar sweepAngle={frame * 2.5} opacity={0.65 * exitOpacity} size={2100} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: finalOpacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 10,
          padding: '0 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ transform: `rotate(${frame * 0.25}deg)` }}>
          <BakasBrandMark size={144} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 104,
            fontWeight: 900,
            color: colors.white,
            marginTop: 32,
            marginBottom: 0,
            letterSpacing: -3,
            fontFamily,
          }}
        >
          Bakas
        </h1>

        <p
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: colors.sky,
            marginTop: 12,
            marginBottom: 16,
            fontFamily,
          }}
        >
          Road Hazard Radar
        </p>

        <p
          style={{
            fontSize: 25,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.65)',
            margin: 0,
            maxWidth: 720,
            lineHeight: 1.45,
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
// Scene 7: Portrait Brand Outro (24.5s – 27.0s | Frames 735 – 810)
// Simple, elegant, clear call to action
// =============================================================================
const PortraitOutroScene: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(frame, [0, 16], [18, 0], { extrapolateRight: 'clamp' })
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
      <BackgroundSonar sweepAngle={frame * 2.5} opacity={0.65} size={2100} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 10,
          padding: '0 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ transform: `rotate(${frame * 0.25}deg)` }}>
          <BakasBrandMark size={132} withGlow={true} />
        </div>

        <h1
          style={{
            fontSize: 98,
            fontWeight: 900,
            color: colors.white,
            marginTop: 28,
            marginBottom: 0,
            letterSpacing: -2.5,
            fontFamily,
          }}
        >
          Bakas
        </h1>

        <p
          style={{
            fontSize: 30,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.75)',
            marginTop: 14,
            marginBottom: 38,
            maxWidth: 720,
            lineHeight: 1.45,
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
            gap: 14,
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: colors.white,
            padding: '20px 52px',
            borderRadius: 999,
            fontSize: 27,
            fontWeight: 700,
            boxShadow:
              '0 12px 36px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
            fontFamily,
          }}
        >
          <span>Open Road Radar</span>
          <span style={{ fontSize: 28 }}>→</span>
        </div>

        <span
          style={{
            opacity: buttonOpacity,
            fontSize: 16,
            fontWeight: 600,
            color: colors.textDim,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
            marginTop: 34,
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
// Master Portrait Composition: 1080x1920 (9:16)
// 810 frames @ 30fps (27.0 seconds)
// =============================================================================
export const BakasShowcasePortrait: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.obsidian }}>
      {/* 0.0s – 3.0s (90f): Intro Scene */}
      <Sequence from={0} durationInFrames={90} layout="absolute-fill">
        <PortraitIntroScene />
      </Sequence>

      {/* 3.0s – 7.5s (135f): Slide 1 - Radar Map */}
      <Sequence from={90} durationInFrames={135} layout="absolute-fill">
        <PortraitSlideScene
          kicker="RADAR MAP"
          headline="See hazards reported nearby."
          body="Live community alerts for potholes, floods, and road hazards along your route."
          capture="capture-1-radar-overview.png"
          kickerColor={colors.sky}
          enterDirection="up"
        />
      </Sequence>

      {/* 7.5s – 12.0s (135f): Slide 2 - 1-Tap Pinning */}
      <Sequence from={225} durationInFrames={135} layout="absolute-fill">
        <PortraitSlideScene
          kicker="QUICK REPORT"
          headline="Report hazards in one tap."
          body="Pin potholes, flooded streets, or obstacles in seconds. No login required."
          capture="capture-2-report-drawer.png"
          kickerColor={colors.amber}
          enterDirection="left"
        />
      </Sequence>

      {/* 12.0s – 16.5s (135f): Slide 3 - Resolution Verification */}
      <Sequence from={360} durationInFrames={135} layout="absolute-fill">
        <PortraitSlideScene
          kicker="COMMUNITY VERIFIED"
          headline="Confirm when roads are fixed."
          body="Compare before-and-after photos and vote with the community to clear resolved reports."
          capture="capture-3-flood-passability.png"
          kickerColor={colors.emerald}
          enterDirection="right"
        />
      </Sequence>

      {/* 16.5s – 21.0s (135f): Slide 4 - Route Search */}
      <Sequence from={495} durationInFrames={135} layout="absolute-fill">
        <PortraitSlideScene
          kicker="FAST SEARCH"
          headline="Check major routes instantly."
          body="Search EDSA, C-5, Commonwealth, and major roads to see current hazards."
          capture="capture-4-search-modal.png"
          kickerColor={colors.sky}
          enterDirection="left"
        />
      </Sequence>

      {/* 21.0s – 24.5s (105f): Slide 5 - Offline Ready */}
      <Sequence from={630} durationInFrames={105} layout="absolute-fill">
        <PortraitSlideScene
          kicker="OFFLINE READY"
          headline="Works even without signal."
          body="Saves reports offline in tunnels and dead zones, then syncs automatically."
          capture="capture-5-about-modal.png"
          kickerColor={colors.cyan}
          enterDirection="up"
        />
      </Sequence>

      {/* 24.5s – 27.0s (75f): Outro Scene */}
      <Sequence from={735} durationInFrames={75} layout="absolute-fill">
        <PortraitOutroScene />
      </Sequence>
    </AbsoluteFill>
  )
}
