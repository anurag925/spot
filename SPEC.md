# spot - Pin the Hidden Gems

## Concept & Vision

spot is a playful, explorer-focused app where people mark special locations on the map with names, stories, or recommendations. Think "graffiti for the map" — places that might not be famous but deserve attention. The vibe is adventurous, slightly irreverent, and community-driven. The UI feels like a modern map app with smooth interactions.

## Design Language

**Aesthetic Direction:** Modern map app with glassmorphism UI elements, smooth animations, and a clean color palette. Feels premium and intuitive.

**Color Palette:**
- Primary: `#FF5A5F` (coral red)
- Primary Hover: `#E04E53` (darker coral)
- Background: `#F7F7F9` (light gray)
- Surface: `#FFFFFF` (white)
- Surface Glass: `rgba(255, 255, 255, 0.85)` (frosted glass)
- Text: `#222222` (near black)
- Text Muted: `#717171` (medium gray)
- Border: `#EBEBEB` (light border)

**Category Colors:**
- Hidden Gem: `#E76F51` (terra cotta)
- Lookout: `#2D5A4B` (forest green)
- Food: `#F4A261` (amber)
- Meetup: `#6B5B95` (purple)
- Other: `#8B8680` (muted gray)

**Typography:**
- Headings: `Fraunces` - serif with personality
- Body: `DM Sans` - clean, readable
- Fallbacks: Georgia, system-ui

**Spatial System:**
- 8px base unit
- 20px/24px padding on cards
- Map dominates viewport
- Border radius: 20px for cards, 9999px for pills/buttons

**Motion Philosophy:**
- Smooth slide-up animations for cards (0.4s cubic-bezier)
- Fly-to animations on map for location changes
- Pulsing animation on user location marker
- Hover transforms on buttons

## Layout & Structure

**Single Page Application:**
1. **Map** - Full viewport, interactive Leaflet map (z-index: 20)
2. **UI Overlay** - Header, filters, and controls (z-index: 10)
3. **Spot Card** - Bottom sheet that slides up showing spot details
4. **Add Modal** - Centered modal with form for new spots

**Responsive Strategy:**
- Mobile: Full-screen map, bottom sheet for spot details, floating header
- Desktop: Side-positioned spot card (360px width), map fills screen

## Features & Interactions

**Core Features:**

1. **View Spots**
   - All spots display as custom markers on map
   - Click marker → shows spot card with details
   - Filter spots by category using pill buttons
   - User location shown with pulsing blue marker on first load

2. **Add Spot**
   - Click "Add Spot" → enters add mode with crosshair overlay
   - Drag/pan map to position crosshair over desired location
   - Click "Confirm Location" → opens modal form
   - Fill in: Name (required), Story (optional), Category
   - Submit → marker appears on map at confirmed location

3. **Get Directions**
   - Click "Directions" button on spot card
   - Opens Google Maps in new window with destination set to spot location

4. **Locate User**
   - Click locate button in header
   - Map flies to user's current location
   - Pulsing blue marker shows current position

**Categories & Marker Colors:**
- Hidden Gem: `#E76F51` (terra cotta)
- Lookout: `#2D5A4B` (forest green)
- Food: `#F4A261` (amber)
- Meetup: `#6B5B95` (purple)
- Other: `#8B8680` (muted gray)

**Edge Cases:**
- Empty state: "No spots yet. Be the first to mark something special!"
- Geolocation denied: Falls back to default location (Meghalaya, India)
- Map drag: Works anywhere on screen (touch-action: none on map container)

## Component Inventory

**SpotCard:**
- States: hidden (translated off-screen), visible (slides up)
- Shows: marker color dot, name (Fraunces), category badge, story, date, directions button
- Close button in top-right corner

**AddModal:**
- States: hidden, visible (with scale animation)
- Form fields: name input, story textarea, category selector grid
- Submit button: disabled until name is filled

**MapMarker:**
- SVG pin shape with category color fill
- White circle center
- Drop shadow

**UserLocationMarker:**
- Pulsing blue dot with expanding ring animation
- 40x40px container

**CategoryFilter Pills:**
- States: inactive (glass background), active (dark background)
- Horizontal scroll on mobile with hidden scrollbar
- Category dot indicator + label

**Header:**
- Logo: "spot" in Fraunces with map pin SVG icon
- Locate button: circular icon button
- Add button: coral background, rounded pill

**Crosshair Overlay:**
- Centered crosshair when in add mode
- Tooltip: "Drag to position"
- Appears above map with z-index: 5

**ConfirmBar:**
- Hidden by default, slides up when in add mode
- Cancel button (secondary), Confirm Location button (primary)

## Technical Approach

**Stack:**
- Backend: Bun HTTP server (fullstack mode)
- Database: SQLite via `bun:sqlite`
- Frontend: React 18 with TypeScript
- Maps: Leaflet with OpenStreetMap tiles
- Bundler: Bun's built-in bundler

**Project Structure:**
```
spot/
├── public/
│   └── index.html              # HTML entry point
├── server/
│   ├── db/
│   │   └── index.ts            # SQLite database setup
│   ├── routes/
│   │   └── spots.ts            # API route handlers
│   └── index.ts                # Server entry point
├── src/
│   ├── styles/
│   │   └── index.css           # All CSS styles
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── App.tsx                 # Main React component
│   └── main.tsx                # React entry point
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

**API Design:**
```
GET /api/spots
→ { spots: [{ id, name, story, lat, lng, category, created_at }] }

POST /api/spots
← { name, story, lat, lng, category }
→ { spot: { id, name, story, lat, lng, category, created_at } }
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

**Map Configuration:**
- Leaflet with OpenStreetMap tiles
- Default center: Meghalaya, India (25.475, 91.452)
- Default zoom: 14
- No zoom controls displayed
- User location marker with pulsing animation