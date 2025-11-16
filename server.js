// server.js
import express from "express";
import "dotenv/config.js";
import cors from "cors";
import connectDB from "./server/configs/db.js";
import userRouter from "./server/routes/userRoutes.js";
import hotelRouter from "./server/routes/hotelRoutes.js";
import roomRouter from "./server/routes/roomRoutes.js";
import bookingRouter from "./server/routes/bookingRoutes.js";
import authRouter from "./server/routes/authRoutes.js";
import connectCloudinary from "./server/configs/cloudinary.js";
import faceAuthRoutes from "./server/routes/faceAuthRoutes.js";
import { stripeWebhooks } from "./server/controllers/bookingController.js"; // Même fichier
import recommendationRouter from './server/routes/recommendationRoutes.js';

connectDB();
connectCloudinary();

const app = express();

// ⚠️ TRÈS IMPORTANT : Webhook DOIT être le premier middleware
app.post('/webhook/stripe', express.raw({type: "application/json"}), stripeWebhooks);

// Ensuite les autres middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => res.send("API IS WORKING"));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/face", faceAuthRoutes);
app.use('/api/recommendations', recommendationRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));