import { sql } from "../db";

/**
 * @openapi
 * /api/spots:
 *   get:
 *     summary: Get all spots
 *     responses:
 *       200:
 *         description: List of spots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 spots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       story: { type: string }
 *                       lat: { type: number }
 *                       lng: { type: number }
 *                       category: { type: string }
 *                       created_at: { type: string }
 *   post:
 *     summary: Create a new spot
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lat, lng]
 *             properties:
 *               name: { type: string }
 *               story: { type: string }
 *               lat: { type: number }
 *               lng: { type: number }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Created spot
 *       400:
 *         description: Missing required fields
 */

/**
 * @openapi
 * /api/spots/nearby:
 *   get:
 *     summary: Get spots near coordinates
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: integer, default: 5000 }
 *     responses:
 *       200:
 *         description: List of nearby spots
 *       400:
 *         description: Missing lat/lng parameters
 */

interface CreateSpotBody {
  name: string;
  story?: string;
  lat: number;
  lng: number;
  category?: string;
}

export const spotsRoutes = {
  async GET() {
    const spots = await sql`
      SELECT id, name, story, lat, lng, category, created_at
      FROM spots
      ORDER BY created_at DESC
    `;
    return Response.json({ spots });
  },

  async POST(req: Request) {
    const body = await req.json() as CreateSpotBody;
    const { name, story, lat, lng, category = "other" } = body;

    if (!name || lat === undefined || lng === undefined) {
      return Response.json({ error: "Name, lat, and lng are required" }, { status: 400 });
    }

    const [spot] = await sql`
      INSERT INTO spots (name, story, location, category)
      VALUES (
        ${name},
        ${story || ""},
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${category}
      )
      RETURNING id, name, story, lat, lng, category, created_at
    `;

    return Response.json({ spot }, { status: 201 });
  },

  async nearby(req: Request) {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get("lat") || "");
    const lng = parseFloat(url.searchParams.get("lng") || "");
    const radius = parseInt(url.searchParams.get("radius") || "5000", 10);

    if (isNaN(lat) || isNaN(lng)) {
      return Response.json({ error: "lat and lng query parameters are required" }, { status: 400 });
    }

    const spots = await sql`
      SELECT
        id, name, story, lat, lng, category, created_at,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
        ) AS distance
      FROM spots
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radius}
      )
      ORDER BY distance ASC
    `;

    return Response.json({ spots });
  },
};
