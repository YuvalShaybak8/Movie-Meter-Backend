import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import https from "https";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig";

import UserRoute from "./routes/userRoutes";
import RatingRoute from "./routes/ratingRoutes";
import authRoute from "./routes/authRoutes";

dotenv.config();

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const projectRoot = process.cwd();

// Check for GOOGLE_CLIENT_ID
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("GOOGLE_CLIENT_ID is not set in the environment variables");
  process.exit(1);
}

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(projectRoot, "public")));

// API routes
app.use("/auth", authRoute);
app.use("/users", UserRoute);
app.use("/ratings", RatingRoute);
app.use("/uploads", express.static(path.join(projectRoot, "uploads")));

// Use Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve the frontend build in production mode
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(projectRoot, "public", "index.html"));
  });
}

app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
});

const startServer = async () => {
  try {
    mongoose.connection.on("error", (error) => console.error(error));
    mongoose.connection.once("open", () =>
      console.log("connected to database")
    );

    await mongoose.connect(process.env.DATABASE_URL!);

    // Only start the server if not in test mode
    if (process.env.NODE_ENV !== "test") {
      // HTTP Server
      app.listen(HTTP_PORT, () => {
        console.log(`HTTP Server running on port ${HTTP_PORT}`);
      });

      // HTTPS Server
      try {
        const httpsOptions = {
          key: fs.readFileSync(path.join(projectRoot, "server.key")),
          cert: fs.readFileSync(path.join(projectRoot, "server.cert")),
        };

        https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
          console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
        });
      } catch (httpsError) {
        console.error("Failed to start HTTPS server:", httpsError);
        console.log("Continuing with HTTP server only.");
      }
    }
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();

export default app;
