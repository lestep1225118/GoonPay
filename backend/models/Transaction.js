import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  amount: { type: Number, required: true },
  note: String,

  type: {
    type: String,
    enum: ["transfer", "reward", "purchase"],
    default: "transfer"
  },

  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },

  timestamp: { type: Date, default: Date.now }
});

TransactionSchema.index({ class: 1, timestamp: -1 });
TransactionSchema.index({ to: 1, class: 1 });
TransactionSchema.index({ from: 1, class: 1 });

export default mongoose.model("Transaction", TransactionSchema);
