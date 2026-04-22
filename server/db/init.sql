-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create spots table with PostGIS geography column
-- location stores (lng, lat) as geography(POINT, 4326) — PostGIS uses lng/lat order
CREATE TABLE IF NOT EXISTS spots (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  story TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add generated lat/lng columns using separate statements for SQLite-like compatibility
ALTER TABLE spots ADD COLUMN lat DOUBLE PRECISION GENERATED ALWAYS AS (ST_Y(location::geometry)) STORED;
ALTER TABLE spots ADD COLUMN lng DOUBLE PRECISION GENERATED ALWAYS AS (ST_X(location::geometry)) STORED;

-- Spatial index for fast DWithin queries
CREATE INDEX IF NOT EXISTS spots_location_idx ON spots USING GIST(location);

-- Files table for storing uploaded file metadata
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  original_name TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  spot_id INTEGER REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS files_spot_id_idx ON files(spot_id);
