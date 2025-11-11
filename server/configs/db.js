import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("❌ MONGODB_URI non définie");
      return false;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.log("❌ MongoDB connection error:", error.message);
    return false; // ⚠️ Ne pas crasher
  }
};

export default connectDB;