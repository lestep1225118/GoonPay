import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }, // professor or TA

  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 1 }, // in class MoonBucks
  imageUrl: { type: String },

  isActive: { type: Boolean, default: true }, // false when "sold" / removed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ListingSchema.index({ class: 1, isActive: 1 });

export default mongoose.model("Listing", ListingSchema);
