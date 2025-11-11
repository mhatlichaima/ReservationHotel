import express from "express";
import "dotenv/config.js";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import authRouter from "./routes/authRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import faceAuthRoutes from "./routes/faceAuthRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Route de base IMMÉDIATE
app.get("/", (req, res) => res.send("API IS WORKING - SERVEUR ACTIF"));

// ✅ Variables de statut
let dbConnected = false;
let cloudinaryConnected = false;

// ✅ Connexion DB sans bloquer le démarrage
connectDB().then(success => {
  dbConnected = success;
  if (success) {
    console.log("✅ MongoDB connecté - Activation des routes API");
    // Activer les routes API seulement si DB connectée
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/hotels", hotelRouter);
    app.use("/api/rooms", roomRouter);
    app.use("/api/bookings", bookingRouter);
    app.use("/api/face", faceAuthRoutes);
  } else {
    console.log("⚠️ Routes API désactivées - DB non connectée");
  }
});

// ✅ Connexion Cloudinary sans bloquer
connectCloudinary().then(success => {
  cloudinaryConnected = success;
  if (success) {
    console.log("✅ Cloudinary connecté");
  } else {
    console.log("⚠️ Cloudinary non connecté");
  }
});

// ✅ Route de santé pour vérifier les connexions
app.get("/health", (req, res) => {
  res.json({
    status: "server_running",
    database: dbConnected ? "connected" : "disconnected",
    cloudinary: cloudinaryConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// ✅ Route de test API basique
app.get("/api/test", (req, res) => {
  res.json({
    message: "API endpoint working",
    database: dbConnected ? "active" : "inactive",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});