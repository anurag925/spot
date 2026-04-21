# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

spot is a map-based app for marking special locations ("hidden gems") with names, stories, and categories. It uses a Bun HTTP server with Hono framework for the backend, libsql (SQLite) for persistence, and vanilla JS with Leaflet for the frontend.

## Commands

```bash
bun --watch server.ts   # Development with hot reload
bun server.ts           # Production start
```

No build step is required—Bun serves the app directly. There are no tests configured.

## Architecture

**Server** (`server.ts`): Bun HTTP server using Hono for routing. Serves `index.html` at `/` and provides a REST API at `/api/spots`.

**API Endpoints:**
- `GET /api/spots` — Returns all spots as `{ spots: [...] }`
- `POST /api/spots` — Creates a spot, expects `{ name, story, lat, lng, category }`

**Database** (`spot.db`): libsql/SQLite file-based database. Schema defined in `server.ts`:
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

**Frontend:**
- `index.html` — Main page, served as-is
- `src/main.js` — Leaflet map initialization, marker management, modal logic, API calls
- `src/styles.css` — All styling

## Category System

Categories have associated colors defined in `src/main.js`:
- hidden gem → `#E76F51` (terra cotta)
- lookout → `#2D5A4B` (forest green)
- food → `#F4A261` (amber)
- meetup → `#6B5B95` (purple)
- other → `#8B8680` (muted gray)

## Key Implementation Details

- Map uses OpenStreetMap tiles via Leaflet
- Custom SVG markers via `L.divIcon` with inline SVG
- Default map center: Meghalaya, India (25.475, 91.452)
- Spot card slides up from bottom on marker click
- Modal has a separate Leaflet instance for picking location
- Markers are re-rendered when category filter changes