import { fileURLToPath } from "url";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

// Create __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Movie Meter Project API",
      version: "1.0.0",
      description: "API documentation for your project",
    },
    servers: [
      {
        url: "http://localhost:5500",
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.ts")],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
