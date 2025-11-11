import Hotel from "../models/hotel.model.js";
import User from "../models/user.model.js";

export const registerHotel = async (req, res) => {
  try {
    const { name, contact, address, city } = req.body;
    
    console.log('📍 Hotel registration attempt by user:', req.user._id, 'Current role:', req.user.role);

    // Vérifier si l'hôtel existe déjà
    const existingHotel = await Hotel.findOne({ 
      $or: [
        { name },
        { contact }
      ]
    });

    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: "Hotel with this name or contact already exists"
      });
    }

    // ✅ CHANGER LE RÔLE SI UTILISATEUR NORMAL
    let userUpdated = false;
    if (req.user.role === "user") {
      console.log('🔄 Changing user role from user to host...');
      await User.findByIdAndUpdate(req.user._id, { role: "host" });
      userUpdated = true;
      console.log('✅ User role updated to host');
    }

    // Créer le nouvel hôtel
    const hotel = await Hotel.create({
      name,
      contact,
      address,
      city,
      owner: req.user._id
    });

    console.log('✅ Hotel created:', hotel._id);

    // ✅ RÉCUPÉRER L'UTILISATEUR COMPLET MIS À JOUR
    const updatedUser = await User.findById(req.user._id).select("-password");
    console.log('✅ Updated user from database - Role:', updatedUser.role);

    res.status(201).json({
      success: true,
      message: userUpdated 
        ? "Hotel registered successfully! You are now a hotel owner." 
        : "Hotel registered successfully!",
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        contact: hotel.contact,
        address: hotel.address,
        city: hotel.city
      },
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        recentSearchedCities: updatedUser.recentSearchedCities
      }
    });

  } catch (error) {
    console.error('💥 Hotel registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ NOUVEAU : Récupérer les hôtels de l'utilisateur connecté
export const getMyHotels = async (req, res) => {
  try {
    console.log('🔍 Fetching hotels for user:', req.user._id);
    
    const hotels = await Hotel.find({ owner: req.user._id });
    
    console.log('✅ Found hotels:', hotels.length);
    
    res.json({
      success: true,
      hotels: hotels.map(hotel => ({
        _id: hotel._id,
        name: hotel.name,
        contact: hotel.contact,
        address: hotel.address,
        city: hotel.city,
        status: hotel.status,
        createdAt: hotel.createdAt
      })),
      message: `Found ${hotels.length} hotel(s) for ${req.user.username}`
    });
    
  } catch (error) {
    console.error('💥 Error fetching user hotels:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ NOUVEAU : Récupérer tous les hôtels (pour admin ou usage général)
export const getHotels = async (req, res) => {
  try {
    console.log('🔍 Fetching all hotels...');
    
    const hotels = await Hotel.find().populate('owner', 'username email');
    
    console.log('✅ Total hotels found:', hotels.length);
    
    res.json({
      success: true,
      hotels: hotels.map(hotel => ({
        _id: hotel._id,
        name: hotel.name,
        contact: hotel.contact,
        address: hotel.address,
        city: hotel.city,
        status: hotel.status,
        owner: hotel.owner,
        createdAt: hotel.createdAt
      })),
      message: `Found ${hotels.length} hotel(s) in total`
    });
    
  } catch (error) {
    console.error('💥 Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};