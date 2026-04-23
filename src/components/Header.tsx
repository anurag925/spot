import { MapPin } from 'lucide-react';

interface HeaderProps {
  onLocate: () => void;
  onAddSpot: () => void;
}

export function Header({ onLocate, onAddSpot }: HeaderProps) {
  return (
    <header className="interactive">
      <div className="logo">
        <MapPin size={28} strokeWidth={2.5} />
        spot
      </div>
    </header>
  );
}