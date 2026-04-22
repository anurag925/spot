# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

spot is a map-based app for marking special locations ("hidden gems") with names, stories, and categories. It uses Bun's fullstack architecture with React + TypeScript for the frontend and Bun's native HTTP server for the backend. Data is stored in PostgreSQL with PostGIS for spatial queries.

## Commands

```bash
bun --watch server/index.ts   # Development with hot reload
bun server/index.ts           # Production start
```

## Environment Variables

A `DATABASE_URL` environment variable is **required**. Set it to a PostgreSQL connection string (e.g., `postgres://user:pass@host:5432/db`).

## Architecture

```
spot/
├── public/
│   └── index.html             # Static HTML entry point
├── server/
│   ├── db/
│   │   ├── index.ts           # PostgreSQL connection (postgres.js)
│   │   └── init.sql           # PostGIS schema initialization
│   ├── routes/
│   │   └── spots.ts           # Spots CRUD + nearby endpoints
│   ├── env.ts                 # Environment variable validation
│   └── index.ts               # Bun server entry point
├── src/
│   ├── components/
│   │   ├── AddSpotModal.tsx   # Modal to add new spot
│   │   ├── ConfirmBar.tsx     # Confirmation bar for actions
│   │   ├── Crosshair.tsx      # Map crosshair overlay
│   │   ├── EmptyState.tsx     # Empty state display
│   │   ├── FilterPills.tsx    # Category filter buttons
│   │   ├── Header.tsx         # App header
│   │   ├── MapControls.tsx    # Map control buttons (locate, add)
│   │   ├── SpotCard.tsx       # Spot detail card
│   │   └── Toast.tsx          # Toast notification
│   ├── styles/
│   │   └── index.css          # Tailwind styles
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── App.tsx                # Main React component
│   └── main.tsx                # React entry point
├── postcss.config.js          # PostCSS config (Tailwind + autoprefixer)
├── tailwind.config.js         # Tailwind theme with color tokens
├── package.json
├── tsconfig.json
└── .env                       # Environment variables (not committed)
```

## API Endpoints

- `GET /` — Serves the React app
- `GET /api/spots` — Returns all spots as `{ spots: [...] }`, ordered by newest first
- `POST /api/spots` — Creates a spot, expects `{ name, story?, lat, lng, category? }`
- `GET /api/spots/nearby?lat=X&lng=Y&radius=N` — Returns spots within N meters of coordinates, ordered by distance

## Database Schema (PostgreSQL + PostGIS)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE spots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  story TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,  -- stores (lng, lat) as PostGIS POINT
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Generated columns for lat/lng access:
  lat DOUBLE PRECISION GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED,
  lng DOUBLE PRECISION GENERATED ALWAYS AS (ST_X(location::geometry)) STORED
);

CREATE INDEX spots_location_idx ON spots USING GIST(location);
```

Note: PostGIS uses **(lng, lat)** order internally. The `lat`/`lng` columns are generated from the `location` geography column for convenience.

## Category System

Category colors are defined in `tailwind.config.js`:
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
- Tailwind CSS v4 with PostCSS for styling