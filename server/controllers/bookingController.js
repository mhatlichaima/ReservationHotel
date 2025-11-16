// controllers/bookingController.js - VERSION COMPLÈTE ET CORRECTE
import Stripe from "stripe";
import transporter from "../configs/nodemailer.js";
import Booking from "../models/booking.model.js";
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==================== FONCTIONS EXISTANTES ====================

// func to check availibility of room
const checkAvailability = async ({ checkInDate, checkOutDate, room}) => {
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
    return false;
  }
}

// api to check availability of room
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
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;
    
    // Vérifier disponibilité
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    
    if(!isAvailable){
      return res.json({success: false, message: "Room is not available"})
    }
    
    // Calculer prix total
    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;
    
    // Créer réservation
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    })

    // Email de confirmation
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: 'Hotel Booking Details',
      html: `
        <h2> Your Booking Details</h2>
        <p> Dear ${req.user.username},</p>
        <p>Thank you for booking! Here are your details:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${booking._id}</li>
          <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
          <li><strong>Location:</strong> ${roomData.hotel.address}</li>
          <li><strong>Check-in:</strong> ${new Date(checkInDate).toDateString()}</li>
          <li><strong>Check-out:</strong> ${new Date(checkOutDate).toDateString()}</li>
          <li><strong>Total Amount:</strong> ${booking.totalPrice} DT</li>
        </ul>
        <p>We look forward to welcoming you!</p>
      `
    }
    await transporter.sendMail(mailOptions)

    res.json({success: true, message: "Booking created successfully", bookingId: booking._id})

  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Failed to create booking"})
  }
};

// api to get all bookings for a user 
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({user})
      .populate("room")
      .populate("hotel")
      .sort({createdAt: -1});
    
    console.log("📊 Bookings utilisateur:", bookings.map(b => ({
      id: b._id,
      isPaid: b.isPaid,
      hotel: b.hotel?.name,
      stripeSessionId: b.stripeSessionId ? "YES" : "NO"
    })));
    
    res.json({success: true, bookings})
  } catch (error) {
    console.error("Erreur getUserBookings:", error);
    res.json({success: false, message: "Failed to fetch bookings"});
  }
}

export const getHotelBookings = async (req, res) => {
  try {
    console.log("=== 🏨 DASHBOARD HOST ===");
    
    const hotels = await Hotel.find({ owner: req.user._id });
    
    if (hotels.length === 0) {
      return res.json({ 
        success: true, 
        DashboardData: { totalBookings: 0, totalRevenue: 0, bookings: [] }
      });
    }

    const hotelIds = hotels.map(h => h._id);
    
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate("user", "username email")
      .populate("room", "roomType pricePerNight")
      .populate("hotel", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const totalBookings = await Booking.countDocuments({ 
      hotel: { $in: hotelIds } 
    });

    const totalRevenue = bookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + b.totalPrice, 0);

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

// ==================== FONCTIONS DE PAIEMENT STRIPE ====================

// Paiement Stripe - VERSION CORRIGÉE
export const stripePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log("💰 Début paiement Stripe pour booking:", bookingId);
    
    const booking = await Booking.findById(bookingId)
      .populate('room')
      .populate('hotel')
      .populate('user', 'email username');

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.isPaid) {
      return res.json({ success: false, message: "Booking already paid" });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${booking.hotel.name} - ${booking.room.roomType}`,
              description: `Check-in: ${new Date(booking.checkInDate).toDateString()} | Check-out: ${new Date(booking.checkOutDate).toDateString()}`,
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-bookings?payment_success=true&session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-bookings?payment_canceled=true&booking_id=${bookingId}`,
      metadata: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
      customer_email: booking.user.email,
    });

    console.log("✅ Session Stripe créée:", session.id);
    
    // ✅ CORRECTION : SAUVEGARDER IMMÉDIATEMENT LA SESSION ID DANS LA BASE DE DONNÉES
    await Booking.findByIdAndUpdate(bookingId, {
      stripeSessionId: session.id
    });
    
    console.log("💾 Session ID sauvegardée dans la base de données");

    res.json({ 
      success: true, 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error("❌ Erreur Stripe:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment Failed: " + error.message 
    });
  }
}

// Vérifier statut paiement par bookingId
export const checkPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    res.json({ 
      success: true, 
      isPaid: booking.isPaid,
      booking: {
        _id: booking._id,
        isPaid: booking.isPaid,
        totalPrice: booking.totalPrice,
        paymentDate: booking.paymentDate,
        stripeSessionId: booking.stripeSessionId
      }
    });

  } catch (error) {
    console.error("Erreur vérification paiement:", error);
    res.json({ 
      success: false, 
      message: "Error checking payment status" 
    });
  }
}

// ==================== FONCTIONS DE VÉRIFICATION ====================

// Vérification forcée manuelle
export const forceCheckPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    console.log("🔧 FORCE CHECK pour booking:", bookingId);
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // Si le booking a un sessionId Stripe, vérifier DIRECTEMENT avec l'API Stripe
    if (booking.stripeSessionId) {
      try {
        const session = await stripeInstance.checkout.sessions.retrieve(
          booking.stripeSessionId
        );
        
        console.log("🎯 Session Stripe trouvée:", {
          id: session.id,
          payment_status: session.payment_status,
          status: session.status
        });

        // SI LE PAIEMENT EST RÉUSSI DANS STRIPE MAIS PAS DANS NOTRE BD
        if (session.payment_status === 'paid' && !booking.isPaid) {
          console.log("💰 Paiement DÉTECTÉ via API Stripe - Mise à jour URGENTE...");
          
          await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            paymentMethod: "Stripe",
            paymentDate: new Date(),
            paymentStatus: "completed"
          });

          const updatedBooking = await Booking.findById(bookingId);
          console.log("✅ Mise à jour URGENCE réussie - isPaid:", updatedBooking.isPaid);
          
          return res.json({ 
            success: true, 
            isPaid: true,
            message: "PAYMENT VERIFIED AND UPDATED - Webhook missed but payment was successful",
            source: "stripe_api_forced_check"
          });
        }
      } catch (stripeError) {
        console.error("❌ Erreur API Stripe:", stripeError);
      }
    }

    // Si on arrive ici, soit pas de sessionId, soit paiement pas encore fait
    console.log("📊 Statut actuel - isPaid:", booking.isPaid);
    res.json({ 
      success: true, 
      isPaid: booking.isPaid,
      message: booking.isPaid ? "Already paid" : "Payment not completed yet",
      hasStripeSession: !!booking.stripeSessionId
    });

  } catch (error) {
    console.error("❌ Erreur force check:", error);
    res.json({ 
      success: false, 
      message: "Error force checking payment: " + error.message 
    });
  }
}

// Vérification automatique après retour de paiement
export const verifyPaymentAfterReturn = async (req, res) => {
  try {
    const { sessionId, bookingId } = req.body;
    
    console.log("🔍 VÉRIFICATION AUTOMATIQUE après retour Stripe");
    console.log("Session ID:", sessionId);
    console.log("Booking ID:", bookingId);

    if (!sessionId || !bookingId) {
      return res.json({ success: false, message: "Session ID and Booking ID required" });
    }

    // 1. Vérifier la session Stripe DIRECTEMENT
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    
    console.log("📊 Statut session Stripe:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total
    });

    // 2. Si le paiement est réussi, mettre à jour la base de données
    if (session.payment_status === 'paid') {
      console.log("💰 PAIEMENT CONFIRMÉ - Mise à jour de la base de données...");
      
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { 
          isPaid: true,
          paymentMethod: "Stripe",
          paymentDate: new Date(),
          stripeSessionId: sessionId,
          paymentStatus: "completed"
        },
        { new: true }
      );

      if (!updatedBooking) {
        console.error("❌ Booking non trouvé lors de la mise à jour");
        return res.json({ success: false, message: "Booking not found during update" });
      }

      console.log("✅ BASE DE DONNÉES MISE À JOUR - isPaid:", updatedBooking.isPaid);

      // Vérification finale
      const finalCheck = await Booking.findById(bookingId);
      console.log("🔍 VÉRIFICATION FINALE - isPaid:", finalCheck.isPaid);

      return res.json({ 
        success: true, 
        isPaid: true,
        message: "Payment verified and database updated successfully",
        paymentStatus: session.payment_status,
        booking: {
          _id: finalCheck._id,
          isPaid: finalCheck.isPaid,
          totalPrice: finalCheck.totalPrice,
          paymentDate: finalCheck.paymentDate
        }
      });

    } else {
      console.log("❌ Paiement non complet - Statut:", session.payment_status);
      return res.json({ 
        success: true, 
        isPaid: false,
        message: `Payment status: ${session.payment_status}`,
        paymentStatus: session.payment_status
      });
    }

  } catch (error) {
    console.error("❌ Erreur vérification automatique:", error);
    return res.json({ 
      success: false, 
      message: "Verification failed: " + error.message 
    });
  }
}

// Vérification par sessionId direct
export const checkPaymentBySession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    console.log("🔍 Vérification par sessionId direct:", sessionId);

    if (!sessionId) {
      return res.json({ success: false, message: "Session ID required" });
    }

    // 1. Vérifier la session Stripe
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    
    console.log("📊 Session Stripe:", {
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      metadata: session.metadata
    });

    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return res.json({ success: false, message: "No booking ID in session metadata" });
    }

    // 2. Trouver la réservation
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log("📋 Booking trouvé - isPaid actuel:", booking.isPaid);

    // 3. Si le paiement est réussi, mettre à jour
    if (session.payment_status === 'paid' && !booking.isPaid) {
      console.log("💰 Paiement confirmé - Mise à jour...");
      
      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentMethod: "Stripe",
        paymentDate: new Date(),
        stripeSessionId: sessionId,
        paymentStatus: "completed"
      });

      const updatedBooking = await Booking.findById(bookingId);
      console.log("✅ Mise à jour réussie - Nouveau isPaid:", updatedBooking.isPaid);

      return res.json({ 
        success: true, 
        isPaid: true,
        message: "Payment verified and updated successfully!",
        booking: updatedBooking
      });
    }

    // 4. Si déjà payé ou autre statut
    res.json({ 
      success: true, 
      isPaid: booking.isPaid,
      paymentStatus: session.payment_status,
      message: booking.isPaid ? "Already paid" : `Payment status: ${session.payment_status}`
    });

  } catch (error) {
    console.error("❌ Erreur vérification par session:", error);
    res.json({ 
      success: false, 
      message: "Verification failed: " + error.message 
    });
  }
}

// ==================== WEBHOOK STRIPE ====================

export const stripeWebhooks = async (req, res) => {
  console.log("🔔 Webhook Stripe reçu à:", new Date().toISOString());
  
  const sig = req.headers['stripe-signature'];
  
  let event;

  try {
    // Vérifier que le secret webhook est configuré
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET manquant dans .env");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // Utiliser le body brut pour la signature
    event = stripeInstance.webhooks.constructEvent(
      req.body, // Body brut déjà parsé par express.raw()
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log("✅ Signature vérifiée - Type:", event.type);
    
  } catch (err) {
    console.error("❌ Erreur signature webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Gérer le paiement réussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      console.log("💰 Paiement réussi détecté");
      console.log("📋 Session ID:", session.id);
      console.log("🎯 Booking ID:", bookingId);
      console.log("📦 Metadata:", session.metadata);

      if (!bookingId) {
        console.error("❌ Aucun bookingId dans les metadata");
        return res.status(400).json({ error: "Missing bookingId in metadata" });
      }

      // Mettre à jour la réservation
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { 
          isPaid: true,
          paymentMethod: "Stripe",
          paymentDate: new Date(),
          stripeSessionId: session.id,
          paymentStatus: "completed"
        },
        { new: true }
      );

      if (!updatedBooking) {
        console.error("❌ Booking non trouvé:", bookingId);
        return res.status(404).json({ error: "Booking not found" });
      }

      console.log("✅ Booking mis à jour avec succès");
      console.log("📊 Statut isPaid:", updatedBooking.isPaid);

      // Vérifier la mise à jour en base de données
      const verifiedBooking = await Booking.findById(bookingId);
      console.log("🔍 Vérification BD - isPaid:", verifiedBooking.isPaid);

      // Envoyer email de confirmation
      try {
        const populatedBooking = await Booking.findById(bookingId)
          .populate('user')
          .populate('hotel')
          .populate('room');

        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: populatedBooking.user.email,
          subject: 'Paiement Confirmé - Détails de Réservation',
          html: `
            <h2>Paiement Confirmé !</h2>
            <p>Cher ${populatedBooking.user.username},</p>
            <p>Votre paiement a été confirmé avec succès.</p>
            <h3>Détails de la réservation:</h3>
            <ul>
              <li><strong>ID Réservation:</strong> ${populatedBooking._id}</li>
              <li><strong>Hôtel:</strong> ${populatedBooking.hotel.name}</li>
              <li><strong>Chambre:</strong> ${populatedBooking.room.roomType}</li>
              <li><strong>Check-in:</strong> ${new Date(populatedBooking.checkInDate).toDateString()}</li>
              <li><strong>Check-out:</strong> ${new Date(populatedBooking.checkOutDate).toDateString()}</li>
              <li><strong>Montant payé:</strong> ${populatedBooking.totalPrice} DT</li>
            </ul>
            <p>Merci pour votre confiance !</p>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log("📧 Email de confirmation envoyé");
      } catch (emailError) {
        console.error("❌ Erreur envoi email:", emailError);
      }

    } else {
      console.log("ℹ️ Événement non géré:", event.type);
    }

    res.json({ received: true, message: "Webhook processed successfully" });

  } catch (error) {
    console.error("❌ Erreur traitement webhook:", error);
    res.status(500).json({ error: "Webhook processing failed: " + error.message });
  }
}

// ==================== FONCTION DE DEBUG ====================

export const debugBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log("=== 🐛 DEBUG BOOKING ===");
    console.log("Booking ID:", bookingId);
    
    const booking = await Booking.findById(bookingId)
      .populate('user')
      .populate('hotel')
      .populate('room');

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    console.log("📊 Détails booking:", {
      id: booking._id,
      isPaid: booking.isPaid,
      totalPrice: booking.totalPrice,
      stripeSessionId: booking.stripeSessionId,
      paymentDate: booking.paymentDate,
      user: booking.user?.email,
      hotel: booking.hotel?.name,
      room: booking.room?.roomType
    });

    // Si sessionId existe, vérifier avec Stripe
    if (booking.stripeSessionId) {
      try {
        const session = await stripeInstance.checkout.sessions.retrieve(booking.stripeSessionId);
        console.log("🎯 Session Stripe:", {
          id: session.id,
          payment_status: session.payment_status,
          status: session.status
        });
      } catch (stripeError) {
        console.error("❌ Erreur session Stripe:", stripeError.message);
      }
    }

    res.json({
      success: true,
      booking: {
        _id: booking._id,
        isPaid: booking.isPaid,
        totalPrice: booking.totalPrice,
        stripeSessionId: booking.stripeSessionId,
        paymentDate: booking.paymentDate,
        user: booking.user?.email,
        hotel: booking.hotel?.name,
        room: booking.room?.roomType
      }
    });

  } catch (error) {
    console.error("❌ Erreur debug:", error);
    res.json({ success: false, message: "Debug failed: " + error.message });
  }
}