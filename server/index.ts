import { serve } from "bun";
import { spotsRoutes } from "./routes/spots";
import { filesRoutes } from "./routes/files";
import { swaggerSpec } from "./docs/swagger";
import { SWAGGER_UI_HTML } from "./docs/swagger-ui-html";
import homepage from "../public/index.html";

const isProduction = process.env.NODE_ENV === "production";


const server = serve({
 routes: {
    "/": homepage,
    "/api/spots": spotsRoutes,
    "/api/spots/nearby": async (req) => spotsRoutes.nearby(req),
    "/api/files": filesRoutes,
    "/api/docs": new Response(SWAGGER_UI_HTML, { 
      headers: { "Content-Type": "text/html" }, 
    }),
    "/api/swagger.json": new Response(JSON.stringify(swaggerSpec), {
      headers: { "Content-Type": "application/json" },
    }),
  },

  development: isProduction ? false : {
    hmr: true,
    console: true,
  },
});

console.log(`spot running at ${server.url}`);
console.log(`mode: ${isProduction ? "production" : "development"}`);