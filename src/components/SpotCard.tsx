import { Spot, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

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
      <button className="close-card" onClick={onClose}>
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <line x1={18} y1={6} x2={6} y2={18} />
          <line x1={6} y1={6} x2={18} y2={18} />
        </svg>
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

      <button className="direction-btn" onClick={onDirections} title="Get Directions">
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      </button>
    </div>
  );
}
