import { MapPin, Crosshair, Plus } from 'lucide-react';

interface HeaderProps {
  onLocate: () => void;
  onAddSpot: () => void;
}

export function Header({ onLocate, onAddSpot }: HeaderProps) {
  return (
    <header className="header interactive">
      <div className="logo">
        <MapPin size={20} />
        spot
      </div>
      <div className="header-actions">
        <button
          id="locate-btn"
          onClick={onLocate}
          title="My Location"
        >
          <Crosshair size={20} />
        </button>
        <button id="add-btn" onClick={onAddSpot}>
          <Plus size={18} />
          Add Spot
        </button>
      </div>
    </header>
  );
}