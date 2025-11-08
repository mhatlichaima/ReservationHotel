// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // new
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: [{ type: String }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
