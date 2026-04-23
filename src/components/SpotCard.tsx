import { type Spot, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import { X, Navigation } from 'lucide-react';

interface SpotCardProps {
  spot: Spot | null;
  isVisible: boolean;
  onClose: () => void;
  onDirections: () => void;
}

export function SpotCard({ spot, isVisible, onClose, onDirections }: SpotCardProps) {
  if (!spot) return null;

  return (
    <div className={`spot-card interactive ${isVisible ? 'visible' : ''}`}>
      <div className="spot-card-handle" />
      <button onClick={onClose}>
        <X size={18} />
      </button>

      <div className="spot-card-header">
        <div
          className="spot-marker-dot"
          style={{ background: CATEGORY_COLORS[spot.category] }}
        />
        <div>
          <h2 className="spot-card-title">{spot.name}</h2>
          <span
            className="spot-card-category"
            style={{
              background: CATEGORY_COLORS[spot.category],
              color: spot.category === 'food' ? '#1A1A1A' : 'white',
            }}
          >
            {CATEGORY_LABELS[spot.category]}
          </span>
        </div>
      </div>

      <p className="spot-card-story">
        {spot.story || "No story yet, but it's definitely worth a visit!"}
      </p>

      <p className="spot-card-date">
        Added{' '}
        {new Date(spot.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <button onClick={onDirections} title="Get Directions">
        <Navigation size={18} />
      </button>
    </div>
  );
}