// routes/bookingRoutes.js - VERSION COMPLÈTE
import express from "express";
import { 
  checkAvailabilityApi, 
  createBooking, 
  getUserBookings, 
  getHotelBookings, 
  stripePayment,
  checkPaymentStatus,
  forceCheckPayment,
  verifyPaymentAfterReturn,
  checkPaymentBySession,
  stripeWebhooks,
  debugBooking
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Routes publiques
bookingRouter.post('/check-availability', checkAvailabilityApi);

// Routes protégées
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/hotel', protect, getHotelBookings);
bookingRouter.post('/stripe-payment', protect, stripePayment);
bookingRouter.get('/:bookingId/payment-status', protect, checkPaymentStatus);
bookingRouter.post('/force-check-payment', protect, forceCheckPayment);
bookingRouter.post('/verify-payment-return', protect, verifyPaymentAfterReturn);
bookingRouter.post('/check-payment-by-session', protect, checkPaymentBySession);
bookingRouter.get('/debug/:bookingId', protect, debugBooking);

export default bookingRouter;