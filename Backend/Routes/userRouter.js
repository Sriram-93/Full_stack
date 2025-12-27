import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/UserSchema.js"; // Note: Added .js extension
import authMiddleware from "../MiddleWare/authMiddleWare.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log({ name, email, password });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/saved", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("savedBlogs")
      .select("savedBlogs");
    res.json({
      success: true,
      savedBlogs: user.savedBlogs,
    });
  } catch (err) {
    console.error("FETCH SAVED BLOGS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch saved posts" });
  }
});


export default router;
