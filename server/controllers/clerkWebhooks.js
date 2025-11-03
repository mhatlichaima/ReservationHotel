// controllers/clerkWebhooks.js
import { Webhook } from "svix";
import User from "../models/user.model.js";

const clerkWebhooks = async (req, res) => {
  try {
    console.log("🔔 Clerk webhook called");

    const isTest = !req.headers["svix-id"]; // if no Clerk headers → Postman test

    let payload;
    let eventType;
    let data;

    if (isTest) {
      console.log("🧪 Running in TEST MODE (no svix headers)");
      payload = req.body;
      eventType = payload.type;
      data = payload.data;
    } else {
      const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      const headers = {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      };
      const body = req.body.toString("utf8");
      const evt = whook.verify(body, headers);
      eventType = evt.type;
      data = evt.data;
    }

    console.log("📩 Event type:", eventType);

    if (eventType === "user.created") {
      const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        image: data.image_url,
        role: "user",
        recentSearchedCities: [],
      };
      await User.create(userData);
      console.log("✅ User created successfully:", userData.email);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;
