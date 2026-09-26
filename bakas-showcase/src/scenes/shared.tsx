import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

export const colors = {
  obsidian: '#040406',
  dark: '#09090c',
  surface: '#121218',
  surfaceLight: '#1c1c24',
  border: 'rgba(255, 255, 255, 0.12)',
  borderActive: 'rgba(56, 189, 248, 0.5)',
  sky: '#38bdf8',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  white: '#ffffff',
  textMuted: '#94a3b8',
  textDim: '#64748b',
}

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
export const monoFont =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'

/**
 * Official Bakás Brand Mark
 * Road trace sweeping into a central civic radar beacon
 */
export const BakasBrandMark: React.FC<{ size?: number; withGlow?: boolean }> = ({
  size = 64,
  withGlow = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible', flexShrink: 0 }}
  >
    <defs>
      {withGlow && (
        <filter id="bakas-brand-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      )}
      <linearGradient id="trace-glow-grad" x1="15" y1="85" x2="50" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" stopOpacity="0.2" />
        <stop offset="0.6" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="1" stopColor="#ffffff" />
      </linearGradient>
    </defs>

    {/* Outer Radar Disc */}
    <circle cx="50" cy="50" r="46" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 6" opacity="0.8" />

    {/* Middle Concentric Ring */}
    <circle cx="50" cy="50" r="32" stroke="#334155" strokeWidth="2.5" opacity="0.9" />

    {/* Inner Active Pulse Orbit */}
    <circle cx="50" cy="50" r="18" stroke="#38bdf8" strokeWidth="2" opacity="0.75" />

    {/* Dynamic Road Trace Curve */}
    <path
      d="M 18 86 C 24 68, 36 56, 50 50"
      stroke="url(#trace-glow-grad)"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M 32 88 C 36 74, 42 62, 50 50"
      stroke="#7dd3fc"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="3 5"
      opacity="0.9"
    />

    {/* Center Radar Epicenter Beacon */}
    <circle
      cx="50"
      cy="50"
      r="6"
      fill="#ffffff"
      filter={withGlow ? 'url(#bakas-brand-glow)' : undefined}
    />
    <circle cx="50" cy="50" r="10" stroke="#38bdf8" strokeWidth="1.5" opacity="0.7" />
  </svg>
)

/**
 * Tactical Sonar Background with rotating radar sweep, reticle coordinates, and subtle grid
 */
export const BackgroundSonar: React.FC<{ sweepAngle?: number; opacity?: number }> = ({
  sweepAngle = 0,
  opacity = 0.9,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: colors.obsidian,
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 65%),
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity,
      }}
    >
      {/* Central Radar Rings */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1400,
          height: 1400,
          pointerEvents: 'none',
        }}
      >
        {/* Ring 1 - 250px */}
        <div
          style={{
            position: 'absolute',
            inset: '41%',
            borderRadius: '50%',
            border: '1px solid rgba(56, 189, 248, 0.22)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.05)',
          }}
        />
        {/* Ring 2 - 500px */}
        <div
          style={{
            position: 'absolute',
            inset: '32%',
            borderRadius: '50%',
            border: '1px dashed rgba(56, 189, 248, 0.16)',
          }}
        />
        {/* Ring 3 - 800px */}
        <div
          style={{
            position: 'absolute',
            inset: '21%',
            borderRadius: '50%',
            border: '1.5px solid rgba(255, 255, 255, 0.06)',
          }}
        />
        {/* Ring 4 - 1100px */}
        <div
          style={{
            position: 'absolute',
            inset: '10%',
            borderRadius: '50%',
            border: '1px dashed rgba(255, 255, 255, 0.04)',
          }}
        />

        {/* Crosshairs */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1,
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 1,
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
          }}
        />

        {/* Radar Sweeping Beam */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from ${sweepAngle}deg at 50% 50%, rgba(56, 189, 248, 0.18) 0deg, rgba(56, 189, 248, 0.04) 45deg, transparent 75deg)`,
            transformOrigin: '50% 50%',
          }}
        />
      </div>

      {/* Top Left HUD Telemetry Tag */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontFamily: monoFont,
          fontSize: 13,
          color: colors.textMuted,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: colors.emerald,
            boxShadow: '0 0 8px #10b981',
          }}
        />
        <span>RADAR ENGAGED // NCR METRO SECTOR</span>
      </div>

      {/* Top Right Coordinates */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          right: 48,
          fontFamily: monoFont,
          fontSize: 13,
          color: colors.sky,
          letterSpacing: 1.5,
          opacity: 0.8,
        }}
      >
        14.5995° N, 120.9842° E • ELEV 16M
      </div>

      {/* Technical Telemetry Sub-Tags */}
      <div
        style={{
          position: 'absolute',
          top: 66,
          left: 48,
          fontFamily: monoFont,
          fontSize: 11,
          color: colors.textDim,
          letterSpacing: 2,
        }}
      >
        [ BAKÁS PROTOCOL v2.4 // CIVIC TELEMETRY ]
      </div>

      <div
        style={{
          position: 'absolute',
          top: 66,
          right: 48,
          fontFamily: monoFont,
          fontSize: 11,
          color: colors.textDim,
          letterSpacing: 2,
        }}
      >
        FREQUENCY 1090 MHZ • RANGE 5000M
      </div>
    </div>
  )
}

/**
 * Frosted Glass Caption HUD at bottom of screen
 */
export const GlassCaption: React.FC<{
  kicker: string
  title: string
  detail: string
  badgeNumber?: string | number
  iconType?: 'radar' | 'report' | 'flood' | 'sync' | 'shield'
  align?: 'left' | 'center'
}> = ({ kicker, title, detail, badgeNumber, iconType = 'radar', align = 'left' }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = spring({ frame, fps, config: { damping: 160, stiffness: 130 } })

  const opacity = progress
  const translateY = interpolate(progress, [0, 1], [30, 0])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: align === 'center' ? '50%' : 64,
        transform: align === 'center' ? `translate(-50%, ${translateY}px)` : `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: 'rgba(10, 12, 16, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(56, 189, 248, 0.28)',
        borderRadius: 999,
        padding: '14px 28px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.12)',
        opacity,
        zIndex: 60,
      }}
    >
      {badgeNumber !== undefined ? (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
            fontFamily: monoFont,
          }}
        >
          {badgeNumber}
        </div>
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BakasBrandMark size={30} />
        </div>
      )}
      <div>
        <div
          style={{
            color: colors.sky,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: monoFont,
          }}
        >
          {kicker}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
          <span style={{ color: colors.white, fontSize: 22, fontWeight: 800, fontFamily, letterSpacing: -0.3 }}>
            {title}
          </span>
          <span style={{ color: colors.textMuted, fontSize: 16, fontWeight: 500, fontFamily }}>
            • {detail}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Tactical Screen Mockup Frame for Screenshots
 */
export const TacticalFrame: React.FC<{
  children: React.ReactNode
  width?: number
  height?: number
  scale?: number
  glowColor?: string
}> = ({ children, width = 1440, height = 810, scale = 1, glowColor = colors.sky }) => {
  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        borderRadius: 20,
        overflow: 'hidden',
        border: '1.5px solid rgba(255, 255, 255, 0.16)',
        boxShadow: `
          0 25px 70px rgba(0, 0, 0, 0.9),
          0 0 50px rgba(56, 189, 248, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `,
        backgroundColor: colors.dark,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Device Window Bar */}
      <div
        style={{
          height: 38,
          backgroundColor: 'rgba(15, 17, 23, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
        </div>

        <div
          style={{
            fontFamily: monoFont,
            fontSize: 12,
            color: colors.textMuted,
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: colors.sky, fontWeight: 700 }}>BAKÁS RADAR</span>
          <span>//</span>
          <span>LIVE TELEMETRY VIEWPORT</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: monoFont,
            fontSize: 11,
            color: colors.emerald,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: colors.emerald,
              boxShadow: '0 0 6px #10b981',
            }}
          />
          <span>30 FPS LIVE</span>
        </div>
      </div>

      {/* Screen Viewport Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  )
}
