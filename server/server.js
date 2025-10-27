import express from "express";
import "dotenv/config.js";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();
app.use(cors());

// ✅ Clerk webhook must come BEFORE express.json()
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// ✅ Then parse JSON for all other routes
app.use(express.json());
app.use(clerkMiddleware());

// Test route
app.get("/", (req, res) => res.send("API IS WORKING"));

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
