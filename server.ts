import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db";
import authRoutes from "./src/routes/auth";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));

