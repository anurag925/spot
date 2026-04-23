interface CrosshairProps {
  isActive: boolean;
}

export function Crosshair({ isActive }: CrosshairProps) {
  return (
    <div className={`crosshair ${isActive ? 'active' : ''}`} id="crosshair">
      <div className="crosshair-tooltip">Drag to position</div>
      <div className="crosshair-center" />
    </div>
  );
}