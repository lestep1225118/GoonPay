import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId);

  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    balance: user.balance,
    createdAt: user.createdAt,
  });
});

export default router;
