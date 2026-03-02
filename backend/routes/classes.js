import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import Class from "../models/Class.js";
import ClassMembership from "../models/ClassMembership.js";
import Listing from "../models/Listing.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

function generateJoinCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getMembership(userId, classId) {
  return ClassMembership.findOne({ user: userId, class: classId });
}

function isStaff(role) {
  return role === "professor" || role === "ta";
}


router.get("/", auth, async (req, res) => {
  try {
    const memberships = await ClassMembership.find({ user: req.userId }).populate(
      "class"
    );

    const results = memberships.map((m) => ({
      classId: m.class._id,
      name: m.class.name,
      description: m.class.description,
      role: m.role,
      balance: m.balance,
      code: m.class.code, 
      professor: m.class.professor,
      createdAt: m.class.createdAt,
    }));

    res.json(results);
  } catch (err) {
    console.error("GET /api/classes error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:classId", auth, async (req, res) => {
  try {
    const { classId } = req.params;

    const klass = await Class.findById(classId);
    if (!klass) return res.status(404).json({ error: "Class not found" });

    const membership = await getMembership(req.userId, classId);
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this class" });
    }

    res.json({
      classId: klass._id,
      name: klass.name,
      description: klass.description,
      role: membership.role,
      balance: membership.balance,
      professor: klass.professor,
      membershipId: membership._id,
      code: klass.code,
    });
  } catch (err) {
    console.error("GET /api/classes/:classId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const code = generateJoinCode();

    const newClass = await Class.create({
      name,
      description,
      code,
      professor: req.userId,
    });

    await ClassMembership.create({
      class: newClass._id,
      user: req.userId,
      role: "professor",
      balance: 0,
    });

    res.status(201).json({
      id: newClass._id,
      name: newClass.name,
      description: newClass.description,
      code: newClass.code,
    });
  } catch (err) {
    console.error("POST /api/classes error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/join", auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const klass = await Class.findOne({ code });
    if (!klass) return res.status(404).json({ error: "Class not found" });

    const existing = await ClassMembership.findOne({
      class: klass._id,
      user: req.userId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You are already a member of this class" });
    }

    const membership = await ClassMembership.create({
      class: klass._id,
      user: req.userId,
      role: "student",
      balance: 0,
    });

    res.status(201).json({
      classId: klass._id,
      name: klass.name,
      description: klass.description,
      role: membership.role,
      balance: membership.balance,
    });
  } catch (err) {
    console.error("POST /api/classes/join error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/:classId", auth, async (req, res) => {
  try {
    const { classId } = req.params;

    const klass = await Class.findById(classId);
    if (!klass) return res.status(404).json({ error: "Class not found" });

    const membership = await getMembership(req.userId, classId);
    if (!membership || membership.role !== "professor") {
      return res.status(403).json({ error: "Only professor can delete class" });
    }

    // Remove memberships, listings, transactions linked to this class
    await Promise.all([
      ClassMembership.deleteMany({ class: classId }),
      Listing.deleteMany({ class: classId }),
      Transaction.deleteMany({ class: classId }),
    ]);

    await klass.deleteOne();

    res.json({ message: "Class deleted" });
  } catch (err) {
    console.error("DELETE /api/classes/:classId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:classId/members", auth, async (req, res) => {
  try {
    const { classId } = req.params;

    const me = await getMembership(req.userId, classId);
    if (!me || !isStaff(me.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const members = await ClassMembership.find({ class: classId }).populate(
      "user",
      "username email"
    );

    const formatted = members.map((m) => ({
      membershipId: m._id,
      userId: m.user._id,
      username: m.user.username,
      email: m.user.email,
      role: m.role,
      balance: m.balance,
      joinedAt: m.joinedAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET /api/classes/:classId/members error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:classId/members/:memberId/promote", auth, async (req, res) => {
  try {
    const { classId, memberId } = req.params;

    const me = await getMembership(req.userId, classId);
    if (!me || me.role !== "professor") {
      return res.status(403).json({ error: "Only professor can promote" });
    }

    const member = await ClassMembership.findById(memberId);
    if (!member || member.class.toString() !== classId) {
      return res.status(404).json({ error: "Member not found in this class" });
    }

    if (member.role !== "student") {
      return res.status(400).json({ error: "Only students can be promoted" });
    }

    member.role = "ta";
    await member.save();

    res.json({ message: "Promoted to TA", role: member.role });
  } catch (err) {
    console.error("POST /api/classes/:classId/members/:memberId/promote error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:classId/members/:memberId/kick", auth, async (req, res) => {
  try {
    const { classId, memberId } = req.params;

    const me = await getMembership(req.userId, classId);
    if (!me || !isStaff(me.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const target = await ClassMembership.findById(memberId);
    if (!target || target.class.toString() !== classId) {
      return res.status(404).json({ error: "Member not found in this class" });
    }

    if (target.role === "professor") {
      return res.status(400).json({ error: "Cannot kick the professor" });
    }

    await target.deleteOne();

    res.json({ message: "Member kicked from class" });
  } catch (err) {
    console.error("POST /api/classes/:classId/members/:memberId/kick error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:classId/members/:memberId/reward", auth, async (req, res) => {
  try {
    const { classId, memberId } = req.params;
    const { amount, note } = req.body;

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Amount must be > 0" });
    }
    if (parsedAmount > 1000) {
      return res.status(400).json({ error: "Max reward is 1000 MoonBucks" });
    }

    const me = await getMembership(req.userId, classId);
    if (!me || !isStaff(me.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const targetMembership = await ClassMembership.findById(memberId);
    if (!targetMembership || targetMembership.class.toString() !== classId) {
      return res.status(404).json({ error: "Member not found in this class" });
    }

    if (targetMembership.role !== "student") {
      return res.status(400).json({ error: "Can only reward students" });
    }

    targetMembership.balance += parsedAmount;
    await targetMembership.save();

    await Transaction.create({
      from: me.user,
      to: targetMembership.user,
      amount: parsedAmount,
      note: note || "Class reward",
      type: "reward",
      class: classId,
    });

    res.json({
      message: "Reward sent",
      newBalance: targetMembership.balance,
    });
  } catch (err) {
    console.error("POST /api/classes/:classId/members/:memberId/reward error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/:classId/listings", auth, async (req, res) => {
  try {
    const { classId } = req.params;

    const me = await getMembership(req.userId, classId);
    if (!me) {
      return res.status(403).json({ error: "Not a member of this class" });
    }

    const listings = await Listing.find({ class: classId, isActive: true })
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.json(
      listings.map((l) => ({
        id: l._id,
        title: l.title,
        description: l.description,
        price: l.price,
        imageUrl: l.imageUrl,
        createdBy: {
          id: l.createdBy._id,
          username: l.createdBy.username,
        },
        createdAt: l.createdAt,
      }))
    );
  } catch (err) {
    console.error("GET /api/classes/:classId/listings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:classId/listings", auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, price, imageUrl } = req.body;

    const me = await getMembership(req.userId, classId);
    if (!me || !isStaff(me.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: "Price must be > 0" });
    }

    const listing = await Listing.create({
      class: classId,
      createdBy: req.userId,
      title,
      description,
      price: parsedPrice,
      imageUrl,
    });

    res.status(201).json({
      id: listing._id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      imageUrl: listing.imageUrl,
    });
  } catch (err) {
    console.error("POST /api/classes/:classId/listings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/:classId/listings/:listingId", auth, async (req, res) => {
  try {
    const { classId, listingId } = req.params;

    const me = await getMembership(req.userId, classId);
    if (!me || !isStaff(me.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing || listing.class.toString() !== classId) {
      return res.status(404).json({ error: "Listing not found in this class" });
    }

    listing.isActive = false;
    await listing.save();

    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("DELETE /api/classes/:classId/listings/:listingId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post(
  "/:classId/listings/:listingId/purchase",
  auth,
  async (req, res) => {
    try {
      const { classId, listingId } = req.params;

      const membership = await getMembership(req.userId, classId);
      if (!membership) {
        return res.status(403).json({ error: "Not a member of this class" });
      }
      if (membership.role !== "student") {
        return res.status(403).json({ error: "Only students can purchase" });
      }

      const listing = await Listing.findById(listingId);
      if (
        !listing ||
        !listing.isActive ||
        listing.class.toString() !== classId
      ) {
        return res
          .status(404)
          .json({ error: "Listing not found or unavailable" });
      }

      if (membership.balance < listing.price) {
        return res
          .status(400)
          .json({ error: "Insufficient MoonBucks in this class" });
      }

      const sellerMembership = await ClassMembership.findOne({
        user: listing.createdBy,
        class: classId,
      });

      if (!sellerMembership) {
        return res.status(500).json({
          error: "Seller is not a member of this class (data inconsistency)",
        });
      }

      membership.balance -= listing.price;
      sellerMembership.balance += listing.price;

      await membership.save();
      await sellerMembership.save();

      listing.isActive = false;
      await listing.save();

      await Transaction.create({
        from: membership.user,
        to: sellerMembership.user,
        amount: listing.price,
        note: `Purchase of "${listing.title}" in class`,
        type: "purchase",
        class: classId,
        listing: listing._id,
      });

      res.json({
        message: "Purchase successful",
        newBalance: membership.balance,
      });
    } catch (err) {
      console.error(
        "POST /api/classes/:classId/listings/:listingId/purchase error:",
        err
      );
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
