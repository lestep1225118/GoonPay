import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  balance: { type: Number, default: 1000 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);
