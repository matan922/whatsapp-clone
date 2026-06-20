import dotenv from 'dotenv';
dotenv.config()
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { connectDB } from './config/db.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent
}));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
