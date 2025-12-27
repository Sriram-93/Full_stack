import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config(); 
import User from "./Models/UserSchema.js";

import app from "./app.js";
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/BlogApp")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Welcome to the Blog API");
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
