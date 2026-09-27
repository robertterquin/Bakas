import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { Sparkles } from 'lucide-react';
import { HazardCategory } from '../../types/hazard';
import { HAZARD_CATEGORIES, formatUpvoteBonus } from '../../utils/domain-rules';

interface CircularTtlGaugeProps {
  expiresAt: string;
  createdAt: string;
  category: HazardCategory;
  isResolved?: boolean;
  vouchTrigger?: number; // increments on each +1 Still Here tap
  bonusHoursText?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  onTap?: () => void;
}

export const CircularTtlGauge: React.FC<CircularTtlGaugeProps> = ({
  expiresAt,
  category,
  isResolved = false,
  vouchTrigger = 0,
  bonusHoursText,
  size = 68,
  strokeWidth = 4.5,
  className = '',
  onTap,
}) => {
  const [now, setNow] = useState(() => Date.now());
  const [isSparking, setIsSparking] = useState(false);
  const [showVouchFloat, setShowVouchFloat] = useState(false);

  // Smooth live ticking (every 10s is sufficient, plus instant updates on vouch)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Trigger energy spark & spring fill when user vouches
  useEffect(() => {
    if (vouchTrigger > 0) {
      setIsSparking(true);
      setShowVouchFloat(true);

      const sparkTimer = setTimeout(() => setIsSparking(false), 900);
      const floatTimer = setTimeout(() => setShowVouchFloat(false), 2400);

      return () => {
        clearTimeout(sparkTimer);
        clearTimeout(floatTimer);
      };
    }
  }, [vouchTrigger]);

  const { fraction, value, unit, isExpiringSoon } = useMemo(() => {
    const expiresTime = new Date(expiresAt).getTime();
    const diffMs = Math.max(0, expiresTime - now);
    const categoryMeta = HAZARD_CATEGORIES[category];

    // Reference window: scaled to category maximum consensus ceiling
    const maxTtlMs = (categoryMeta?.maxTtlHours || 48) * 60 * 60 * 1000;
    const cautionThresholdHours = categoryMeta
      ? Math.max(2, Math.floor(categoryMeta.initialTtlHours * 0.25))
      : 6;

    const calculatedFraction = isResolved
      ? 0.05
      : Math.min(1, Math.max(0.04, diffMs / maxTtlMs));

    if (diffMs <= 0 || isResolved) {
      return {
        fraction: isResolved ? 0.05 : 0,
        value: 0,
        unit: isResolved ? 'FIXED' : 'EXP',
        isExpiringSoon: true,
      };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (totalHours < 1) {
      const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return {
        fraction: calculatedFraction,
        value: mins,
        unit: 'MIN',
        isExpiringSoon: true,
      };
    }

    if (totalHours < 24) {
      return {
        fraction: calculatedFraction,
        value: totalHours,
        unit: 'HRS',
        isExpiringSoon: totalHours <= cautionThresholdHours,
      };
    }

    const days = Math.floor(totalHours / 24);
    return {
      fraction: calculatedFraction,
      value: days,
      unit: days === 1 ? 'DAY' : 'DAYS',
      isExpiringSoon: totalHours <= cautionThresholdHours,
    };
  }, [expiresAt, category, now, isResolved]);

  // Geometry
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);

  // Minimalist Complementing Colors
  const progressColor = isResolved
    ? '#71717a'
    : isExpiringSoon
    ? '#f59e0b'
    : '#ffffff';

  const glowFilter = isResolved
    ? 'none'
    : isExpiringSoon
    ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))'
    : 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.6))';

  return (
    <div
      onClick={onTap}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Community TTL: ${value} ${unit} remaining. Vouching adds +24h community visibility.`}
    >
      {/* SVG Circular Gauge with Live Vouch Physics */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Background Track Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="rgba(9, 9, 11, 0.85)"
        />

        {/* Outer Fine Ticks Guide Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 3.5}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={1}
          strokeDasharray="2, 6"
          fill="none"
        />

        {/* Dynamic Perimeter Gauge with Spring Physics */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 14,
          }}
          style={{
            transformOrigin: `${center}px ${center}px`,
            transform: 'rotate(-90deg)',
            filter: glowFilter,
          }}
        />

        {/* Live Vouch Energy Spark Wave Ripple */}
        <AnimatePresence>
          {isSparking && (
            <motion.circle
              key="vouch-energy-ripple"
              cx={center}
              cy={center}
              r={radius}
              stroke="#ffffff"
              fill="transparent"
              initial={{ r: radius, opacity: 1, strokeWidth: 4 }}
              animate={{ r: radius + 14, opacity: 0, strokeWidth: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 10px #ffffff)' }}
            />
          )}
        </AnimatePresence>

        {/* Orbiting Energy Spark Particle */}
        <AnimatePresence>
          {isSparking && (
            <motion.g
              key="vouch-spark-orbit"
              style={{ transformOrigin: `${center}px ${center}px` }}
              animate={{ rotate: [-90, 270] }}
              transition={{ duration: 0.85, ease: 'easeInOut' }}
            >
              <circle
                cx={center + radius}
                cy={center}
                r={2.5}
                fill="#ffffff"
                style={{ filter: 'drop-shadow(0 0 8px #ffffff)' }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Center Countdown Telemetry */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono font-bold text-xs sm:text-sm text-white leading-none tracking-tight flex items-center justify-center">
          <NumberFlow value={value} />
        </span>
        <span className="font-mono font-bold text-[8px] text-zinc-400 tracking-wider uppercase leading-tight mt-0.5">
          {unit}
        </span>
      </div>

      {/* Floating "+24h Added by Community" Energy Banner */}
      <AnimatePresence>
        {showVouchFloat && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -32, scale: [0.8, 1.02, 1, 0.92] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap"
          >
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-black font-mono font-extrabold text-[9px] shadow-[0_0_18px_rgba(255,255,255,0.9),0_4px_16px_rgba(0,0,0,0.8)] border border-black/20">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{bonusHoursText || `${formatUpvoteBonus(HAZARD_CATEGORIES[category]?.upvoteBonusHours || 24)} EXTENDED`}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
