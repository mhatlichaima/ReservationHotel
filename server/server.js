import express from "express";
import "dotenv/config.js";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Clerk webhook route
app.use("/api/clerk", clerkWebhooks);

// Test route
app.get("/", (req, res) => res.send("API IS WORKING"));

// ✅ Export app (for Vercel serverless)
export default app;

// ✅ Run the server only when not in Vercel environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
