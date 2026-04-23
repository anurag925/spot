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
    <div
      className={`spot-card interactive ${isVisible ? 'visible' : ''}`}
      id="spot-sheet"
    >
      <div className="spot-card-handle" />
      <button
        onClick={onClose}
        className="sheet-close"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--bg)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={18} />
      </button>

      <div className="spot-cat-badge">
        <div
          className="dot"
          id="sheet-dot"
          style={{ background: CATEGORY_COLORS[spot.category] }}
        />
        <span id="sheet-cat-text">{CATEGORY_LABELS[spot.category]}</span>
      </div>

      <h2 className="spot-card-title" id="sheet-title">
        {spot.name}
      </h2>

      <p className="spot-card-story" id="sheet-story">
        {spot.story || "No story yet, but it's definitely worth a visit!"}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}
      >
        <span className="spot-card-date">
          Added{' '}
          {new Date(spot.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <button
          onClick={onDirections}
          className="direction-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Get Directions
          <Navigation size={16} />
        </button>
      </div>
    </div>
  );
}