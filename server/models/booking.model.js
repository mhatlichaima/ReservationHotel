// models/booking.model.js - VERSION CORRIGÉE
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // 🔥 ObjectId obligatoire
        ref: "User", 
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId, // 🔥 ObjectId obligatoire
        ref: "Room", 
        required: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId, // 🔥 ObjectId obligatoire
        ref: "Hotel", 
        required: true
    },
    checkInDate: {
        type: Date, 
        required: true
    },
    checkOutDate: {
        type: Date, 
        required: true
    },
    totalPrice: {
        type: Number, 
        required: true
    },
    guests: {
        type: Number, 
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
    },
    paymentMethod: {
        type: String,
        required: true,
        default: "Pay At Hotel",
    },
    isPaid: {
        type: Boolean, 
        default: false
    },
}, {
    timestamps: true
});

// 🔥 MIDDLEWARE pour s'assurer que les IDs sont des ObjectId
bookingSchema.pre('save', function(next) {
  // Convertir les strings en ObjectId si nécessaire
  if (this.user && typeof this.user === 'string') {
    this.user = new mongoose.Types.ObjectId(this.user);
  }
  if (this.room && typeof this.room === 'string') {
    this.room = new mongoose.Types.ObjectId(this.room);
  }
  if (this.hotel && typeof this.hotel === 'string') {
    this.hotel = new mongoose.Types.ObjectId(this.hotel);
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;