import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface FilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="filters-wrapper interactive">
      <button
        onClick={() => onFilterChange('all')}
      >
        All Spots
      </button>
      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
        >
          <div className="dot" style={{ background: CATEGORY_COLORS[key] }} />
          {label}
        </button>
      ))}
    </div>
  );
}
