import db from "../db";

interface CreateSpotBody {
  name: string;
  story?: string;
  lat: number;
  lng: number;
  category?: string;
}

export const spotsRoutes = {
  async GET() {
    const spots = db.query("SELECT * FROM spots ORDER BY created_at DESC").all();
    return Response.json({ spots });
  },

  async POST(req: Request) {
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
};