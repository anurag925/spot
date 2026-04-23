# Spot App - Z-Index & Layering Guide

## Simplified Z-Index System

The app uses a simple 3-tier layering system:

```
MAP (1)        → Leaflet map tiles
MARKERS (50)   → Spot markers, user location
UI (100+)      → All UI elements (header, buttons, modals, etc.)
```

## Z-Index Map

| Element | z-index | Layer | Notes |
|---------|---------|-------|-------|
| `.map` | 1 | Map | Leaflet map container |
| Leaflet tiles | 1 | Map | Merged into map layer |
| Leaflet marker pane | 50 | Markers | Above map, below all UI |
| Leaflet marker icons | 50 | Markers | Above map, below all UI |
| `.ui-layer` | 100 | UI | Base layer for all UI elements |
| `.crosshair` | 101 | UI | Crosshair overlay when adding spot |
| `.empty-state` | 102 | UI | Shown when no spots exist |
| `.spot-card` | 200 | UI | Bottom sheet for spot details |
| `.modal-overlay` | 300 | UI | Modal backdrop for adding spots |
| `.toast` | 400 | UI | Toast notification (top of UI) |

## Visual Stack (bottom to top)

```
z-index 1:     .map + Leaflet tiles (base map)
z-index 50:    Leaflet markers (spot pins, user location)
z-index 100:   .ui-layer (header, filters, FAB, map controls)
z-index 101:   .crosshair (when adding spot)
z-index 102:   .empty-state (when no spots)
z-index 200:   .spot-card (spot details)
z-index 300:   .modal-overlay (add spot form)
z-index 400:   .toast (notifications)
```

## Layer Relationships

- **Map layer (1):** Base Leaflet map. No UI should be here.
- **Marker layer (50):** All Leaflet markers appear above the map but below UI
- **UI layer (100+):** All our custom UI appears above markers

**Key rule:** UI elements at z-index 100+ will always appear above map markers at z-index 50.

## Adding New UI Elements

**Simple rules:**
- Put all UI inside `.ui-layer` (z:100) - it auto-handles layering
- Modals/sheets: 200-300
- Notifications/toasts: 300-400
- Overlays like crosshair: 101

**Never use z-index below 100 for UI elements** - those are reserved for map/markers.

## Leaflet Pane Overrides

We only override what we use:

```css
.leaflet-tile-pane { z-index: 1; }
.leaflet-marker-pane { z-index: 50 !important; }
.leaflet-marker-icon { z-index: 50 !important; }
```

All other Leaflet panes use their defaults.

## Important CSS Notes

**Use `!important` for z-index** - DaisyUI plugin (used via `@plugin "daisyui"`) has its own z-index scale that can override custom values. Always include `!important` when setting z-index:

```css
.ui-layer {
  z-index: 100 !important;
}
```

## Category Colors

| Category | Color | Hex |
|----------|-------|-----|
| `hidden gem` | Terra cotta | `#E76F51` |
| `lookout` | Forest green | `#2D5A4B` |
| `food` | Amber | `#F4A261` |
| `meetup` | Purple | `#6B5B95` |
| `other` | Gray | `#8B8680` |

## Map Readiness Check

When adding markers, ensure map is fully initialized:

```typescript
// Correct: getZoom() returns undefined during init
if (map.getZoom() === undefined) {
  setTimeout(() => renderMarkers(spots, activeFilter), 100);
  return;
}
```