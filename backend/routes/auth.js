import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: "Username already exists" });

  const hash = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    passwordHash: hash,
  });

  await user.save();
  res.json({ message: "Signup successful" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt,
    },
  });
});

export default router;
