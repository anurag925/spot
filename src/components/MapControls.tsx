import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown, Plus, Minus, Crosshair } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MapControlsProps {
  onPanUp: () => void;
  onPanDown: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

export function MapControls({
  onPanUp,
  onPanDown,
  onPanLeft,
  onPanRight,
  onZoomIn,
  onZoomOut,
  onLocate,
}: MapControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cellSize = isMobile ? '36px' : '44px';
  const iconSize = isMobile ? 16 : 18;
  const gap = isMobile ? '4px' : '6px';
  const panelPadding = isMobile ? '8px' : '12px';
  const bottomPos = isMobile ? '100px' : '120px';

  return (
    <>
      {/* Locate Button - positioned above and to the far right */}
      <button
        id="locate-btn"
        className="icon-btn"
        onClick={onLocate}
        title="My Location"
        style={{
          position: 'fixed',
          bottom: isMobile ? '108px' : '130px',
          right: '20px',
          width: cellSize,
          height: cellSize,
          borderRadius: '10px',
          zIndex: 16,
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Crosshair size={iconSize} strokeWidth={2} />
      </button>

      {/* D-Pad + Zoom panel */}
      <div
        className="map-controls-panel interactive"
        style={{
          position: 'fixed',
          bottom: bottomPos,
          right: '20px',
          zIndex: 15,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'white',
          borderRadius: '16px',
          padding: panelPadding,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        {/* Single row: D-Pad on left, vertical divider, Zoom on right */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          {/* D-Pad */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, ${cellSize})`,
              gridTemplateRows: `repeat(3, ${cellSize})`,
              gap: gap,
            }}
          >
            <div />
            <button onClick={onPanUp} className="icon-btn" style={{ width: cellSize, height: cellSize, borderRadius: '10px' }} title="Move Up">
              <ArrowUp size={iconSize} />
            </button>
            <div />
            <button onClick={onPanLeft} className="icon-btn" style={{ width: cellSize, height: cellSize, borderRadius: '10px' }} title="Move Left">
              <ArrowLeft size={iconSize} />
            </button>
            <div style={{ background: '#f0f0f0', borderRadius: '10px' }} />
            <button onClick={onPanRight} className="icon-btn" style={{ width: cellSize, height: cellSize, borderRadius: '10px' }} title="Move Right">
              <ArrowRight size={iconSize} />
            </button>
            <div />
            <button onClick={onPanDown} className="icon-btn" style={{ width: cellSize, height: cellSize, borderRadius: '10px' }} title="Move Down">
              <ArrowDown size={iconSize} />
            </button>
            <div />
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '1px', height: `calc(3 * ${cellSize} + 2 * ${gap})`, background: '#e5e5e5' }} />

          {/* Zoom */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: `calc(3 * ${cellSize} + 2 * ${gap})`,
            }}
          >
            <button
              onClick={onZoomIn}
              className="icon-btn"
              style={{ width: cellSize, height: cellSize, borderRadius: '10px' }}
              title="Zoom In"
            >
              <Plus size={iconSize} />
            </button>
            <button
              onClick={onZoomOut}
              className="icon-btn"
              style={{ width: cellSize, height: cellSize, borderRadius: '10px' }}
              title="Zoom Out"
            >
              <Minus size={iconSize} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}