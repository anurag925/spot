# spot - Pin the Hidden Gems

## Concept & Vision

spot is a playful, explorer-focused app where people mark special locations on the map with names, stories, or recommendations. Think "graffiti for the map" — places that might not be famous but deserve attention. The vibe is adventurous, slightly irreverent, and community-driven. The UI should feel like a well-worn explorer's journal meets modern cartography.

## Design Language

**Aesthetic Direction:** Cartographic adventure — warm paper textures meeting crisp modern maps. Think old explorer's notebook meets sleek digital atlas.

**Color Palette:**
- Primary: `#2D5A4B` (deep forest green)
- Secondary: `#F4A261` (warm amber/sand)
- Accent: `#E76F51` (terra cotta red - for markers)
- Background: `#FAF6F1` (warm off-white, paper-like)
- Text: `#1A1A1A` (near black)
- Muted: `#8B8680` (warm gray)

**Typography:**
- Headings: `Fraunces` (variable, optical size) - serif with personality
- Body: `DM Sans` - clean, readable
- Fallbacks: Georgia, system-ui

**Spatial System:**
- 8px base unit
- Generous padding on cards (24px)
- Map dominates viewport

**Motion Philosophy:**
- Subtle spring animations on marker drops
- Cards slide up with staggered delays
- Map interactions feel responsive, not sluggish

**Visual Assets:**
- Lucide icons for UI elements
- Custom markers with the terra cotta accent
- Subtle paper texture on backgrounds

## Layout & Structure

**Single Page Application:**
1. **Header** - Minimal: logo/wordmark left, "Add Spot" button right
2. **Map View** - Full viewport height minus header, interactive Leaflet map
3. **Spot Cards** - Overlay panel that slides up from bottom showing spot details
4. **Add Spot Modal** - Centered modal with map picker, name field, story textarea, category selector

**Responsive Strategy:**
- Mobile: Full-screen map, bottom sheet for spot details
- Desktop: Map with floating info panel on right side

## Features & Interactions

**Core Features:**

1. **View Spots**
   - All spots display as custom markers on map
   - Click marker → shows spot card with details
   - Cluster markers when zoomed out

2. **Add Spot**
   - Click "Add Spot" → modal opens
   - Map in modal is interactive - click to place marker
   - Draggable marker for precise placement
   - Fields: Name (required), Story (optional), Category (hidden gem/lookout/food/meetup/other)
   - Submit → marker appears on main map

3. **Explore Spots**
   - Filter by category via pill buttons above map
   - Click any marker to read the story

**Categories & Marker Colors:**
- Hidden Gem: `#E76F51` (terra cotta)
- Lookout: `#2D5A4B` (forest green)
- Food: `#F4A261` (amber)
- Meetup: `#6B5B95` (purple)
- Other: `#8B8680` (muted gray)

**Edge Cases:**
- Empty state: Encouraging message "No spots yet. Be the first to mark something!"
- Long names: Truncate with ellipsis in cards, full name on hover
- Many spots: Clustering kicks in at zoom level < 14

## Component Inventory

**SpotCard:**
- States: default (compact view), expanded (full story)
- Shows: marker color dot, name (Fraunces bold), story preview, category badge, "Read more" if long
- Hover: subtle shadow lift

**AddSpotModal:**
- States: empty, marker placed, filled, submitting, success
- Map with draggable pin
- Form validation: name required, story max 500 chars
- Submit button: disabled until valid, loading spinner during submit

**MapMarker (custom):**
- SVG pin shape with category color fill
- Subtle drop shadow
- Pulse animation on new marker

**CategoryFilter Pills:**
- States: all selected (default), specific category selected
- Horizontal scroll on mobile

**Header:**
- Logo: "spot" in Fraunces italic with small map pin icon
- Add button: Primary color, rounded

## Technical Approach

**Stack:**
- Backend: Bun with Hono framework
- Database: libsql (Turso-compatible local file)
- Frontend: Vanilla JS with Leaflet for maps
- Single HTML file served by Bun

**API Design:**

```
GET /api/spots
→ { spots: [{ id, name, story, lat, lng, category, created_at }] }

POST /api/spots
← { name, story, lat, lng, category }
→ { id, name, story, lat, lng, category, created_at }
```

**Data Model:**
```sql
CREATE TABLE spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  story TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT DEFAULT 'other',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Map:**
- Leaflet with OpenStreetMap tiles
- Default center: San Francisco (37.7749, -122.4194)
- Custom markers using L.divIcon with inline SVG
