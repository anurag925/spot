# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

spot is a map-based app for marking special locations ("hidden gems") with names, stories, and categories. It uses Bun's fullstack architecture with React + TypeScript for the frontend and Bun's native HTTP server for the backend.

## Commands

```bash
bun --watch server.ts   # Development with hot reload
bun server.ts           # Production start
```

## Architecture

**Fullstack Structure:**
```
spot/
├── public/              # Static HTML entry point
│   └── index.html
├── server/              # Bun backend
│   ├── db/              # Database setup
│   │   └── index.ts     # SQLite database initialization
│   ├── routes/          # API route handlers
│   │   └── spots.ts     # Spots CRUD endpoints
│   └── index.ts         # Server entry point
├── src/                 # React frontend
│   ├── components/      # React components (future use)
│   ├── hooks/           # Custom React hooks (future use)
│   ├── styles/          # CSS styles
│   │   └── index.css
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions (future use)
│   ├── App.tsx          # Main React component
│   └── main.tsx         # React entry point
├── package.json
├── tsconfig.json
└── spot.db              # SQLite database file
```

**API Endpoints:**
- `GET /` — Serves the React app (index.html with embedded JSX)
- `GET /api/spots` — Returns all spots as `{ spots: [...] }`
- `POST /api/spots` — Creates a spot, expects `{ name, story, lat, lng, category }`

**Database Schema:**
```sql
CREATE TABLE spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  story TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT DEFAULT 'other',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## Category System

Categories have associated colors defined in `src/types/index.ts`:
- hidden gem → `#E76F51` (terra cotta)
- lookout → `#2D5A4B` (forest green)
- food → `#F4A261` (amber)
- meetup → `#6B5B95` (purple)
- other → `#8B8680` (muted gray)

## Key Implementation Details

- Map uses OpenStreetMap tiles via Leaflet (loaded dynamically)
- Custom SVG markers via `L.divIcon` with inline SVG
- Default map center: Meghalaya, India (25.475, 91.452)
- Spot card slides up from bottom on marker click
- Directions link opens Google Maps in new window
- User location shown with pulsing blue marker
- Filter pills to filter spots by category