import User from "../models/user.model.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    console.log("🔔 Clerk webhook called");

    // ✅ 1. Verify required headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    if (!headers["svix-id"] || !headers["svix-timestamp"] || !headers["svix-signature"]) {
      console.error("❌ Missing Svix headers");
      return res.status(400).json({ success: false, message: "Missing Svix headers" });
    }

    // ✅ 2. Verify signature with raw body (important for Vercel)
    const payload = req.body?.toString("utf8") || "";
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt;
    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error("❌ Invalid Clerk webhook signature:", err.message);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ 3. Parse event safely
    const { data, type } = JSON.parse(payload);
    console.log("📩 Event type:", type);

    // ✅ 4. Build user data object
    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "no-email",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
      role: "user",
      recentSearchedCities: [],
    };

    // ✅ 5. Handle different event types
    switch (type) {
      case "user.created":
        console.log("🧠 Creating user:", userData.email);
        await User.create(userData);
        console.log("✅ User created successfully");
        break;

      case "user.updated":
        console.log("🔄 Updating user:", userData.email);
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        console.log("🗑️ Deleting user:", data.id);
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log("ℹ️ Unhandled event type:", type);
        break;
    }

    // ✅ Respond success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
