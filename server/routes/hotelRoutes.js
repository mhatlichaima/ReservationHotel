import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel, getMyHotels, getHotels } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post('/', protect, registerHotel);
hotelRouter.get('/my-hotels', protect, getMyHotels); // ✅ NOUVELLE ROUTE
hotelRouter.get('/', protect, getHotels); // ✅ NOUVELLE ROUTE

export default hotelRouter;