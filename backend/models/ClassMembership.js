import mongoose from "mongoose";

const ClassMembershipSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    enum: ["professor", "ta", "student"],
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  joinedAt: { type: Date, default: Date.now }
});

// One membership per (class, user)
ClassMembershipSchema.index({ class: 1, user: 1 }, { unique: true });
// For "my classes"
ClassMembershipSchema.index({ user: 1 });
// For class member lists by role
ClassMembershipSchema.index({ class: 1, role: 1 });

export default mongoose.model("ClassMembership", ClassMembershipSchema);
