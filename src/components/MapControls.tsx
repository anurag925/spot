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

  // Configuration based on screen size
  const cellSize = isMobile ? '36px' : '44px';
  const iconSize = isMobile ? 16 : 18;
  const gap = isMobile ? '4px' : '6px';
  const panelPadding = isMobile ? '8px' : '12px';
  const bottomPos = isMobile ? '100px' : '120px';

  // Common button style to reduce repetition
  const baseButtonStyle: React.CSSProperties = {
    width: cellSize,
    height: cellSize,
    borderRadius: '10px',
    background: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    transition: 'background-color 0.2s',
  };

  // Hover effect handling would ideally be done via CSS classes, 
  // but for inline styles, we keep it simple or add onMouseEnter/Leave if needed.
  // Assuming .icon-btn class handles hover states in your global CSS.

  return (
    <div
      style={{
        position: 'fixed',
        bottom: bottomPos,
        right: '20px',
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
    >
      {/* Locate Button */}
      <div className="interactive">
        <button
          id="locate-btn"
          className="icon-btn"
          onClick={onLocate}
          title="My Location"
          aria-label="Center map on my location"
          style={baseButtonStyle}
        >
          <Crosshair size={iconSize} strokeWidth={2} />
        </button>
      </div>

      {/* D-Pad + Zoom panel */}
      <div
        className="map-controls-panel interactive"
        style={{
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
          
          {/* D-Pad Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, ${cellSize})`,
              gridTemplateRows: `repeat(3, ${cellSize})`,
              gap: gap,
            }}
          >
            {/* Top Row */}
            <div />
            <button 
              onClick={onPanUp} 
              className="icon-btn" 
              style={baseButtonStyle} 
              title="Move Up"
              aria-label="Pan up"
            >
              <ArrowUp size={iconSize} />
            </button>
            <div />

            {/* Middle Row */}
            <button 
              onClick={onPanLeft} 
              className="icon-btn" 
              style={baseButtonStyle} 
              title="Move Left"
              aria-label="Pan left"
            >
              <ArrowLeft size={iconSize} />
            </button>
            
            {/* Center Spacer/Divider Background */}
            <div style={{ background: '#f0f0f0', borderRadius: '10px' }} />
            
            <button 
              onClick={onPanRight} 
              className="icon-btn" 
              style={baseButtonStyle} 
              title="Move Right"
              aria-label="Pan right"
            >
              <ArrowRight size={iconSize} />
            </button>

            {/* Bottom Row */}
            <div />
            <button 
              onClick={onPanDown} 
              className="icon-btn" 
              style={baseButtonStyle} 
              title="Move Down"
              aria-label="Pan down"
            >
              <ArrowDown size={iconSize} />
            </button>
            <div />
          </div>

          {/* Vertical Divider */}
          <div 
            style={{ 
              width: '1px', 
              height: `calc(3 * ${cellSize} + 2 * ${gap})`, 
              background: '#e5e5e5',
              alignSelf: 'stretch' // Ensures it aligns correctly if heights vary slightly
            }} 
          />

          {/* Zoom Controls */}
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
              style={baseButtonStyle}
              title="Zoom In"
              aria-label="Zoom in"
            >
              <Plus size={iconSize} />
            </button>
            
            {/* Spacer to push Zoom Out to bottom if needed, or just space-between handles it */}
            
            <button
              onClick={onZoomOut}
              className="icon-btn"
              style={baseButtonStyle}
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <Minus size={iconSize} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}