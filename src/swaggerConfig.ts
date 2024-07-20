import swaggerJSDoc from "swagger-jsdoc";

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
  apis: ["./routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
