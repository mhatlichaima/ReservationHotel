import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log("❌ Variables Cloudinary manquantes");
      return false;
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test la configuration
    await cloudinary.api.ping();
    console.log("✅ Cloudinary connected successfully");
    return true;
  } catch (error) {
    console.log("❌ Cloudinary connection error:", error.message);
    return false; // ⚠️ Ne pas crasher
  }
};

export default connectCloudinary;