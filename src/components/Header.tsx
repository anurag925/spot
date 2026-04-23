import { MapPin, Crosshair } from 'lucide-react';

interface HeaderProps {
  onLocate: () => void;
  onAddSpot: () => void;
}

export function Header({ onLocate, onAddSpot }: HeaderProps) {
  return (
    <header className="interactive">
      <div className="logo">
        <MapPin size={20} strokeWidth={2.5} />
        spot
      </div>
      <button
        id="locate-btn"
        className="icon-btn"
        onClick={onLocate}
        title="My Location"
      >
        <Crosshair size={20} strokeWidth={2} />
      </button>
    </header>
  );
}