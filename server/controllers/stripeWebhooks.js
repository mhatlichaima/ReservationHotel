import Stripe from "stripe";
import transporter from "../configs/nodemailer.js";
import Booking from "../models/booking.model.js"
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";

// Configuration Stripe
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// API to handle stripe webhooks - VERSION CORRIGÉE
export const stripeWebhooks = async (req, res) => {
    console.log("🔔 Webhook Stripe reçu");
    
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
        // IMPORTANT: Pour les webhooks, utiliser le body brut
        const rawBody = req.body;
        
        event = stripeInstance.webhooks.constructEvent(
            rawBody, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        console.log("✅ Signature webhook vérifiée, type:", event.type);
        
    } catch (err) {
        console.error("❌ Erreur signature webhook:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Gérer l'événement de paiement réussi
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const bookingId = session.metadata.bookingId;

            console.log("💰 Paiement réussi pour booking:", bookingId);

            // Marquer le paiement comme payé
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { 
                    isPaid: true, 
                    paymentMethod: "Stripe",
                    paymentDate: new Date(),
                    paymentStatus: "completed"
                },
                { new: true }
            ).populate("user").populate("room").populate("hotel");

            if (!updatedBooking) {
                console.error("❌ Booking non trouvé:", bookingId);
                return res.status(404).json({ error: "Booking not found" });
            }

            console.log("✅ Paiement marqué comme payé pour booking:", bookingId);

            // Envoyer un email de confirmation
            try {
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: updatedBooking.user.email,
                    subject: 'Paiement Confirmé - Détails de Réservation',
                    html: `
                        <h2>Paiement Confirmé !</h2>
                        <p>Cher ${updatedBooking.user.username},</p>
                        <p>Votre paiement a été confirmé avec succès.</p>
                        <h3>Détails de la réservation:</h3>
                        <ul>
                            <li><strong>ID Réservation:</strong> ${updatedBooking._id}</li>
                            <li><strong>Hôtel:</strong> ${updatedBooking.hotel.name}</li>
                            <li><strong>Chambre:</strong> ${updatedBooking.room.roomType}</li>
                            <li><strong>Check-in:</strong> ${new Date(updatedBooking.checkInDate).toDateString()}</li>
                            <li><strong>Check-out:</strong> ${new Date(updatedBooking.checkOutDate).toDateString()}</li>
                            <li><strong>Montant payé:</strong> ${updatedBooking.totalPrice} DT</li>
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