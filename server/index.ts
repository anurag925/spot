import { serve } from "bun";
import { spotsRoutes } from "./routes/spots";
import homepage from "../public/index.html";

const server = serve({
  routes: {
    "/": homepage,
    "/api/spots": spotsRoutes,
    "/api/spots/nearby": async (req) => spotsRoutes.nearby(req),
  },

  development: {
    hmr: true,
    console: true,
  },
});

console.log(`spot running at ${server.url}`);