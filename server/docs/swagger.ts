import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Spot API",
      version: "1.0.0",
      description: "Map-based app for marking special locations",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./server/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);