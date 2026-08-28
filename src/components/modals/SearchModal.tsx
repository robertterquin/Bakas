import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, X, Navigation, Sparkles, ArrowRight } from 'lucide-react';
import {
  searchPhilippineLocations,
  POPULAR_PHILIPPINE_LOCATIONS,
  GeocodedLocation,
} from '../../services/geocoding.service';
import { calculateDistanceInMeters, formatDistance } from '../../services/geo.service';
import { UserLocation } from '../../types/hazard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onSelectLocation: (loc: GeocodedLocation) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchPhilippineLocations(query);
      setResults(data);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const activeItems = query.trim().length >= 2 ? results : POPULAR_PHILIPPINE_LOCATIONS;

  const handleSelect = useCallback(
    (loc: GeocodedLocation) => {
      onSelectLocation(loc);
      onClose();
    },
    [onSelectLocation, onClose]
  );

  // Keyboard navigation (Arrow keys, Enter, Escape)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, activeItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + activeItems.length) % Math.max(1, activeItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeItems[selectedIndex]) {
          handleSelect(activeItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [activeItems, selectedIndex, handleSelect, onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden text-zinc-100 flex flex-col"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/50">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search street, avenue, barangay, or city..."
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
            />
            {isLoading && <LoadingSpinner variant="dual-arc" size={16} className="text-white shrink-0" />}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-mono px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Results / Presets List */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 no-scrollbar">
            {!query.trim() && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Popular Corridors</span>
              </div>
            )}

            {query.trim().length >= 2 && results.length === 0 && !isLoading && (
              <div className="py-12 text-center text-zinc-500 text-xs space-y-1">
                <MapPin className="w-8 h-8 mx-auto text-zinc-700 mb-2 stroke-[1.5]" />
                <p className="font-semibold text-zinc-400">No Philippine locations found</p>
                <p className="text-[11px]">Try searching by street name, city, or coordinates</p>
              </div>
            )}

            {activeItems.map((loc, index) => {
              const isSelected = index === selectedIndex;
              const distMeters = calculateDistanceInMeters(
                userLocation.lat,
                userLocation.lng,
                loc.lat,
                loc.lng
              );

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-white text-black shadow-md'
                      : 'hover:bg-zinc-900/80 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-xl border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Navigation className="w-4 h-4 rotate-45" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-sans truncate">{loc.name}</div>
                      <div
                        className={`text-[11px] truncate ${
                          isSelected ? 'text-zinc-700' : 'text-zinc-500'
                        }`}
                      >
                        {loc.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {formatDistance(distMeters)}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-black' : 'text-zinc-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts Hint */}
          <div className="px-4 py-2.5 bg-zinc-900/30 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-2">
              <span>↑↓ Navigate</span>
              <span>•</span>
              <span>↵ Jump to Location</span>
            </div>
            <span>OpenStreetMap Philippines</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
