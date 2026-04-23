import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const btnSize = isMobile ? '36px' : '40px';
  const iconSize = isMobile ? 16 : 18;
  const gap = isMobile ? '8px' : '12px';
  const panelPadding = isMobile ? '6px' : '10px';
  const bottomPos = isMobile ? '100px' : '120px';

  return (
    <div
      className="map-controls-panel interactive"
      style={{
        position: 'fixed',
        bottom: bottomPos,
        right: '20px',
        zIndex: 15,
        display: 'flex',
        gap: gap,
        background: 'white',
        borderRadius: '16px',
        padding: panelPadding,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* D-Pad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${btnSize})`,
          gridTemplateRows: `repeat(3, ${btnSize})`,
          gap: '4px',
        }}
      >
        <div />
        <button onClick={onPanUp} className="icon-btn" style={{ borderRadius: '8px' }} title="Move Up">
          <ArrowUp size={iconSize} />
        </button>
        <div />
        <button onClick={onPanLeft} className="icon-btn" style={{ borderRadius: '8px' }} title="Move Left">
          <ArrowLeft size={iconSize} />
        </button>
        <div style={{ background: '#f0f0f0', borderRadius: '8px' }} />
        <button onClick={onPanRight} className="icon-btn" style={{ borderRadius: '8px' }} title="Move Right">
          <ArrowRight size={iconSize} />
        </button>
        <div />
        <button onClick={onPanDown} className="icon-btn" style={{ borderRadius: '8px' }} title="Move Down">
          <ArrowDown size={iconSize} />
        </button>
        <div />
      </div>

      {/* Zoom */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onZoomIn}
          className="icon-btn"
          style={{ width: btnSize, height: btnSize, borderRadius: '8px' }}
          title="Zoom In"
        >
          <Plus size={iconSize} />
        </button>
        <button
          onClick={onZoomOut}
          className="icon-btn"
          style={{ width: btnSize, height: btnSize, borderRadius: '8px' }}
          title="Zoom Out"
        >
          <Minus size={iconSize} />
        </button>
      </div>
    </div>
  );
}