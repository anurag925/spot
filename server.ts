import { serve } from "bun";
import { Database } from "bun:sqlite";
import homepage from "./index.html";

// Types
interface CreateSpotBody {
  name: string;
  story?: string;
  lat: number;
  lng: number;
  category?: string;
}

// Initialize database
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

const server = serve({
  routes: {
    "/": homepage,
    "/api/spots": {
      async GET() {
        const spots = db.query("SELECT * FROM spots ORDER BY created_at DESC").all();
        return Response.json({ spots });
      },

      async POST(req) {
        const body = await req.json() as CreateSpotBody;
        const { name, story, lat, lng, category = "other" } = body;

        if (!name || lat === undefined || lng === undefined) {
          return Response.json({ error: "Name, lat, and lng are required" }, { status: 400 });
        }

        const result = db.query(
          "INSERT INTO spots (name, story, lat, lng, category) VALUES (?, ?, ?, ?, ?) RETURNING *"
        ).get(name, story || "", String(lat), String(lng), category);

        return Response.json({ spot: result }, { status: 201 });
      },
    },
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`spot running at ${server.url}`);
