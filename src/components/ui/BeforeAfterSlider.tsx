import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'REPORTED',
  afterLabel = 'CLEARED',
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [handleMove]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="slider"
      aria-label="Before and after comparison slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPosition)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full aspect-[16/10] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-zinc-800 bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-white/40 ${className}`}
    >
      {/* 1. After Image (Background layer) */}
      <img
        src={afterImage}
        alt="Road after resolution"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* 2. Before Image (Clipped overlay layer) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={beforeImage}
          alt="Road before hazard cleared"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
      </div>

      {/* 3. Draggable Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Knob */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/90 border border-white text-white flex items-center justify-center shadow-lg backdrop-blur-md transition-transform duration-100 group-hover:scale-110">
          <ChevronsLeftRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* 4. Tactical HUD Labels */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
        <span className="px-2 py-0.5 rounded-full bg-black/80 border border-zinc-700 text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase backdrop-blur-md shadow">
          {beforeLabel}
        </span>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase backdrop-blur-md shadow">
          ✓ {afterLabel}
        </span>
      </div>

      {/* 5. Instruction hint overlay on hover / idle */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="px-2.5 py-0.5 rounded-full bg-black/70 border border-zinc-800 text-[9px] font-mono text-zinc-400 backdrop-blur-sm shadow">
          Drag slider to compare
        </span>
      </div>
    </div>
  );
};
