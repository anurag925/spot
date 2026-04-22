import { serve } from "bun";
import { spotsRoutes } from "./routes/spots";
import { filesRoutes } from "./routes/files";
import homepage from "../public/index.html";

const server = serve({
  routes: {
    "/": homepage,
    "/api/spots": spotsRoutes,
    "/api/spots/nearby": async (req) => spotsRoutes.nearby(req),
    "/api/files": filesRoutes,
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`spot running at ${server.url}`);