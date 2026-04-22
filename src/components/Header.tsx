interface HeaderProps {
  onLocate: () => void;
  onAddSpot: () => void;
}

export function Header({ onLocate, onAddSpot }: HeaderProps) {
  return (
    <header className="header interactive">
      <div className="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx={12} cy={10} r={3} />
        </svg>
        spot
      </div>
      <div className="header-actions">
        <button
          className="icon-btn"
          id="locate-btn"
          onClick={onLocate}
          title="My Location"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
        <button className="add-btn" id="add-btn" onClick={onAddSpot}>
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <line x1={12} y1={5} x2={12} y2={19} />
            <line x1={5} y1={12} x2={19} y2={12} />
          </svg>
          Add Spot
        </button>
      </div>
    </header>
  );
}
