import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import txRoutes from "./routes/transactions.js";
import classRoutes from "./routes/classes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/classes", classRoutes);

const PORT = process.env.PORT || 5005;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log("Server running on port", PORT));
  })
  .catch((err) => {
    console.error("DB ERROR:", err.message);
    console.error(
      "Fix: Set MONGO_URI in backend/.env to a valid MongoDB URL (e.g. MongoDB Atlas or mongodb://localhost:27017/moonpay)"
    );
    process.exit(1);
  });
