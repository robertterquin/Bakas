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
  { id: 'all', label: 'All', emoji: '🧭' },
  { id: 'pothole', label: 'Potholes', emoji: '🕳️' },
  { id: 'clogged_drainage', label: 'Flooding', emoji: '💧' },
  { id: 'road_obstruction', label: 'Obstructions', emoji: '🚧' },
  { id: 'dark_street', label: 'Dark Streets', emoji: '🌑' },
];

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <nav aria-label="Filter hazard categories" className="absolute top-14 left-0 right-0 z-20 pointer-events-none px-3">
      <div className="max-w-2xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 gap-1.5 pointer-events-auto">
        {FILTER_OPTIONS.map((opt) => {
          const isSelected = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectFilter(opt.id)}
              aria-pressed={isSelected}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-150 border backdrop-blur-md focus-visible:ring-2 focus-visible:ring-sky-400 select-none ${
                isSelected
                  ? 'bg-white text-slate-950 border-white font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              <span className="text-xs">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
