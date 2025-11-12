import transporter from "../configs/nodemailer.js";
import Booking from "../models/booking.model.js"
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";


// func to check availibility of room
const checkAvailability = async ({ checkInDate, checkOutDate, room})=> {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.error(error.message);
    }
}

// api to check availability of room
// post /api/bookings/check-availability
export const checkAvailabilityApi = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate} = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room});
        res.json({success: true, isAvailable});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// api to create a new booking
// post /api/bookings/book
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;
        // before booking check availability
        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });
        if(!isAvailable){
            return res.json({success: false, message: "Room is not available"})
        }
        //get totalPrice from room
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        //calculate totalPrice based on nights
        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice *= nights;
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })


        const mailOptions={
           from:process.env.SENDER_EMAIL,
           to:req.user.email,
           subject:'Hotel Booking Details',
           html:`
             <h2> Your Booking Details</h2>
             <p> Dear ${req.user.username},</p>
             <p>Thank you for booking! Here are your details:</p>
             <ul>
                <li><strong>Booking ID:</strong> ${booking._id}</li>
                <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
                <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                <li><strong>Date:</strong> ${booking.checkInDate.toDateString}</li>
                <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice}/
                night</li>
             </ul>
            <p>We look forward to welcoming you!</p>
            <p>If you need to make any changes, feel free to contact us.</p>
           `
        }
        await transporter.sendMail(mailOptions)

        res.json({success: true, message: "Booking created successfully"})

    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Failed to create booking"})

        
    }
};

// api to get all bookings for a user 
// get /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate("room hotel").sort
        ({createdAt: -1})
        res.json({success: true, bookings})
    } catch (error) {
        res.json({success: false, message: "Failed to fetch bookings"});
    }
}

export const getHotelBookings = async (req, res) => {
  try {
    console.log("=== 🏨 DASHBOARD HOST ===");
    console.log("👤 Host:", req.user.username, "ID:", req.user._id);

    // 1. Trouver TOUS les hôtels de ce host
    const hotels = await Hotel.find({ owner: req.user._id });
    console.log("🏨 Hôtels du host:", hotels.length);
    console.log("📋 Hôtels:", hotels.map(h => ({ id: h._id, name: h.name })));
    
    if (hotels.length === 0) {
      console.log("❌ Le host n'a aucun hôtel");
      return res.json({ 
        success: true, 
        DashboardData: { totalBookings: 0, totalRevenue: 0, bookings: [] }
      });
    }

    const hotelIds = hotels.map(h => h._id);
    console.log("🔍 IDs des hôtels (ObjectId):", hotelIds);

    // 2. DEBUG: Vérifier les réservations AVANT populate
    const rawBookings = await Booking.find({ 
      hotel: { $in: hotelIds } 
    });
    console.log("📊 Réservations brutes trouvées:", rawBookings.length);
    console.log("🔍 Détails bruts:", rawBookings.map(b => ({
      id: b._id,
      hotel: b.hotel,
      user: b.user,
      room: b.room,
      price: b.totalPrice
    })));

    // 3. Récupérer avec populate
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate("user", "username email")
      .populate("room", "roomType pricePerNight")
      .populate("hotel", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("📋 Réservations après populate:", bookings.length);
    
    // Log détaillé
    bookings.forEach((booking, index) => {
      console.log(`📖 Réservation ${index + 1}:`, {
        id: booking._id,
        user: booking.user ? booking.user.username : 'N/A',
        hotel: booking.hotel ? booking.hotel.name : 'N/A', 
        room: booking.room ? booking.room.roomType : 'N/A',
        prix: booking.totalPrice,
        payé: booking.isPaid
      });
    });

    // 4. Calculer les stats
    const totalBookings = await Booking.countDocuments({ 
      hotel: { $in: hotelIds } 
    });

    const totalRevenue = bookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    console.log("💰 Stats finales - Réservations:", totalBookings, "Revenue:", totalRevenue);

    res.json({ 
      success: true, 
      DashboardData: { 
        totalBookings, 
        totalRevenue, 
        bookings 
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur dashboard:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur: " + error.message 
    });
  }
}


export const stripePayment = async (req, res)=>{
  try{
    const { bookingId } =req.body;
    const booking = await Booking.findById(bookingId);
    const roomData = await Room.findById(booking.room).populate('hotel');
    const totalPrice = booking.totalPrice;
    const { origin } = req.headers;
  }catch(error){

  }
}