import User from "../models/user.model.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    console.log("🔔 Clerk webhook called"); // 👈 ADD THIS

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const payload = req.body.toString("utf8");
    const evt = whook.verify(payload, headers);
    const { data, type } = JSON.parse(payload);

    console.log("📩 Event type:", type); // 👈 ADD THIS

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url,
      role: "user",
      recentSearchedCities: [],
    };

    switch (type) {
      case "user.created":
        console.log("🧠 Creating user:", userData.email); // 👈 ADD THIS
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
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
