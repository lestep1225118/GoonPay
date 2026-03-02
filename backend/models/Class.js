import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  code: { type: String, required: true, unique: true }, 
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

ClassSchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Class", ClassSchema);
