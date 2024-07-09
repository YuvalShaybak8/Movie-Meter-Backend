import express from "express";
import cors from "cors";
import path from "path";
import { config } from "dotenv";

config();

const app = express();
const PORT = process.env.PORT || 5500;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.resolve("public")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
