import React from 'react';
import { CategoryFilter } from '../../types/hazard';

interface CategoryFilterBarProps {
  activeFilter: CategoryFilter;
  onSelectFilter: (category: CategoryFilter) => void;
}

interface FilterOption {
  id: CategoryFilter;
  label: string;
  emoji: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Hazards', emoji: '🧭' },
  { id: 'pothole', label: 'Potholes / Manholes', emoji: '🕳️' },
  { id: 'clogged_drainage', label: 'Flooding / Drainage', emoji: '💧' },
  { id: 'road_obstruction', label: 'Obstructions', emoji: '🚧' },
  { id: 'dark_street', label: 'Dark Streets', emoji: '🌑' },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <nav aria-label="Hazard categories filter" className="absolute top-16 left-0 right-0 z-20 pointer-events-none px-3">
      <div className="max-w-4xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-2 gap-2 pointer-events-auto">
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectFilter(opt.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border shadow-md backdrop-blur-md focus-visible:ring-2 focus-visible:ring-sky-400 ${
                isSelected
                  ? 'bg-slate-100 text-slate-950 border-white shadow-[0_0_14px_rgba(255,255,255,0.4)] font-semibold scale-105'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white'
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
