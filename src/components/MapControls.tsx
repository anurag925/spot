import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown, Plus, Minus } from 'lucide-react';

interface MapControlsProps {
  onPanUp: () => void;
  onPanDown: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({
  onPanUp,
  onPanDown,
  onPanLeft,
  onPanRight,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  return (
    <div className="map-controls-panel interactive">
      {/* D-Pad */}
      <div className="map-dpad">
        <div className="map-dpad-row">
          <button onClick={onPanUp} title="Move Up">
            <ArrowUp size={20} />
          </button>
        </div>
        <div className="map-dpad-row">
          <button onClick={onPanLeft} title="Move Left">
            <ArrowLeft size={20} />
          </button>
          <div className="map-dpad-center" />
          <button onClick={onPanRight} title="Move Right">
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="map-dpad-row">
          <button onClick={onPanDown} title="Move Down">
            <ArrowDown size={20} />
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="map-controls">
        <button onClick={onZoomIn} title="Zoom In">
          <Plus size={22} />
        </button>
        <div className="map-control-divider" />
        <button onClick={onZoomOut} title="Zoom Out">
          <Minus size={22} />
        </button>
      </div>
    </div>
  );
}