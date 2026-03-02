import express from "express";
import Transaction from "../models/Transaction.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const txs = await Transaction.find({
      $or: [{ from: req.userId }, { to: req.userId }],
    })
      .sort({ timestamp: -1 })
      .populate("from", "username")
      .populate("to", "username")
      .populate("class", "name code")
      .populate("listing", "title");

    res.json(txs);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/history", auth, async (req, res) => {
  try {
    const txs = await Transaction.find({
      $or: [{ from: req.userId }, { to: req.userId }],
    })
      .sort({ timestamp: -1 })
      .populate("from", "username")
      .populate("to", "username")
      .populate("class", "name code")
      .populate("listing", "title");

    res.json(txs);
  } catch (err) {
    console.error("GET /api/transactions/history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
