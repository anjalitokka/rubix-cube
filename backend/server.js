import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import solveRoutes from "./routes/solveRoutes.js";
import timerRoutes from "./routes/timerRoutes.js";
import detectRoutes from "./routes/detectRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api",solveRoutes);
app.use("/api", timerRoutes);
app.use("/api", detectRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "CubeSolver Express API",
    ok: true,
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});