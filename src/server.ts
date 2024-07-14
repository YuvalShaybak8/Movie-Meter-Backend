import express from "express";
import cors from "cors";
import path from "path";
import { config } from "dotenv";
config();
import mongoose from "mongoose";
import bodyParser from "body-parser";

import UserRoute from "./routes/userRoutes";
import RatingRoute from "./routes/ratingRoutes";
import authRoute from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 5500;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow PUT method
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.resolve("public")));

app.use("/auth", authRoute);
app.use("/users", UserRoute);
app.use("/ratings", RatingRoute);
app.use("/uploads", express.static("uploads"));

app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

const startServer = async () => {
  try {
    mongoose.connection.on("error", (error) => console.error(error));
    mongoose.connection.once("open", () =>
      console.log("connected to database")
    );

    await mongoose.connect(process.env.DATABASE_URL!);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
