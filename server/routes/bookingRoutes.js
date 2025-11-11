// routes/bookingRoutes.js - CORRECTION COMPLÈTE
import express from "express";
import { 
  checkAvailabilityApi, 
  createBooking, 
  getUserBookings, 
  getHotelBookings 
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import Hotel from "../models/hotel.model.js"; // AJOUTEZ CET IMPORT
import Booking from "../models/booking.model.js"; // AJOUTEZ CET IMPORT

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityApi);
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);

// Route de debug
bookingRouter.get('/debug-dashboard', protect, async (req, res) => {
  try {
    console.log("=== DASHBOARD DEBUG ===");
    const hotels = await Hotel.find({ owner: req.user._id });
    
    res.json({
      success: true,
      user: req.user,
      hotels: hotels,
      bookingsCount: hotels.length > 0 ? 
        await Booking.countDocuments({ hotel: { $in: hotels.map(h => h._id) } }) : 0
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// 🔥 CORRECTION : Export default pour rester cohérent
export default bookingRouter;