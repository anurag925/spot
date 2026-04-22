import { Database } from "bun:sqlite";

const db = new Database("spot.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    story TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    category TEXT DEFAULT 'other',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;