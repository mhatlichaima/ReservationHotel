import Hotel from "../models/hotel.model.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/room.model.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities, hotelId } = req.body;
        
        console.log("🔍 User from middleware:", req.user);
        console.log("🔍 User ID:", req.user?._id);
        console.log("🔍 Requested Hotel ID:", hotelId);
        
        let hotel;
        
        if (hotelId) {
            hotel = await Hotel.findById(hotelId);
            console.log("✅ Using specified hotel:", hotel?._id);
        } else {
            hotel = await Hotel.findOne({ owner: req.user._id });
            console.log("⚠️ No hotelId specified, using first hotel:", hotel?._id);
        }

        if (!hotel) {
            console.log("❌ No hotel found");
            return res.json({ success: false, message: "No hotel found. Please register a hotel first." });
        }

        if (hotel.owner.toString() !== req.user._id.toString()) {
            console.log("❌ User doesn't own this hotel");
            return res.json({ 
                success: false, 
                message: "You don't have permission to add rooms to this hotel" 
            });
        }

        console.log("✅ Hotel validated:", hotel._id, "-", hotel.name);

        // Upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        })
        
        const images = await Promise.all(uploadImages)

        const newRoom = await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            images,
        })

        console.log("✅ Room created successfully for hotel:", hotel.name);
        console.log("✅ Room ID:", newRoom._id);

        res.json({ 
            success: true, 
            message: `Room created successfully in ${hotel.name}`,
            room: {
                _id: newRoom._id,
                roomType: newRoom.roomType,
                pricePerNight: newRoom.pricePerNight,
                hotel: {
                    _id: hotel._id,
                    name: hotel.name,
                    city: hotel.city
                }
            }
        })
    } catch (error) {
        console.error("❌ Room creation error:", error);
        res.json({ success: false, message: error.message })
    }
}

// API to get all rooms for customers
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 })
        res.json({ success: true, rooms });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to get all rooms for ALL hotels of the owner - CORRIGÉ
export const getOwnerRooms = async (req, res) => {
    try {
        console.log("🔍 Fetching all rooms for owner:", req.user._id);
        
        // ✅ CORRECTION: Trouver TOUS les hôtels du propriétaire
        const hotels = await Hotel.find({ owner: req.user._id });
        console.log("🏨 Hotels found:", hotels.length);
        
        if (!hotels || hotels.length === 0) {
            console.log("❌ No hotels found for this owner");
            return res.json({ 
                success: true, 
                rooms: [], 
                message: "No hotels found. Please register a hotel first." 
            });
        }

        // ✅ Récupérer les IDs de tous les hôtels
        const hotelIds = hotels.map(hotel => hotel._id);
        console.log("📋 Hotel IDs to search:", hotelIds);

        // ✅ CORRECTION: Trouver TOUTES les chambres de TOUS les hôtels
        const rooms = await Room.find({ 
            hotel: { $in: hotelIds } // ✅ Recherche dans tous les hôtels
        })
        .populate("hotel")
        .sort({ createdAt: -1 });

        console.log(`✅ Found ${rooms.length} rooms across ${hotels.length} hotels`);
        
        // Log détaillé des chambres trouvées
        rooms.forEach((room, index) => {
            console.log(`   ${index + 1}. ${room.roomType} - ${room.hotel?.name} - ${room.pricePerNight}€`);
        });

        res.json({ 
            success: true, 
            rooms,
            stats: {
                totalRooms: rooms.length,
                totalHotels: hotels.length,
                availableRooms: rooms.filter(room => room.isAvailable).length,
                unavailableRooms: rooms.filter(room => !room.isAvailable).length
            }
        });
    } catch (error) {
        console.error("❌ Error in getOwnerRooms:", error);
        res.json({ success: false, message: error.message });
    }
}

// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }

        // Vérifier que l'utilisateur possède l'hôtel de cette chambre
        const hotel = await Hotel.findById(roomData.hotel);
        if (!hotel || hotel.owner.toString() !== req.user._id.toString()) {
            return res.json({ 
                success: false, 
                message: "You don't have permission to modify this room" 
            });
        }

        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        
        res.json({ 
            success: true, 
            message: `Room is now ${roomData.isAvailable ? 'available' : 'unavailable'}`,
            isAvailable: roomData.isAvailable
        })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to delete a room
export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        const roomData = await Room.findById(roomId);
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }

        // Vérifier que l'utilisateur possède l'hôtel de cette chambre
        const hotel = await Hotel.findById(roomData.hotel);
        if (!hotel || hotel.owner.toString() !== req.user._id.toString()) {
            return res.json({ 
                success: false, 
                message: "You don't have permission to delete this room" 
            });
        }

        await Room.findByIdAndDelete(roomId);
        
        res.json({ 
            success: true, 
            message: "Room deleted successfully" 
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to get room by ID
export const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId).populate("hotel");
        
        if (!room) {
            return res.json({ success: false, message: "Room not found" });
        }

        res.json({ success: true, room });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// API to update room
export const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { roomType, pricePerNight, amenities } = req.body;

        const roomData = await Room.findById(roomId);
        if (!roomData) {
            return res.json({ success: false, message: "Room not found" });
        }

        // Vérifier les permissions
        const hotel = await Hotel.findById(roomData.hotel);
        if (!hotel || hotel.owner.toString() !== req.user._id.toString()) {
            return res.json({ 
                success: false, 
                message: "You don't have permission to update this room" 
            });
        }

        // Gérer les images si nouvelles images sont uploadées
        let images = roomData.images;
        if (req.files && req.files.length > 0) {
            const uploadImages = req.files.map(async (file) => {
                const response = await cloudinary.uploader.upload(file.path);
                return response.secure_url;
            });
            images = await Promise.all(uploadImages);
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            {
                roomType,
                pricePerNight: +pricePerNight,
                amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
                images,
            },
            { new: true }
        ).populate("hotel");

        res.json({ 
            success: true, 
            message: "Room updated successfully",
            room: updatedRoom
        });
    } catch (error) {
        console.error("❌ Room update error:", error);
        res.json({ success: false, message: error.message });
    }
}