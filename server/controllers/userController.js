import User from "../models/user.model.js";

// GET /api/user/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('💥 Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUT /api/user/profile - NOUVELLE FONCTION
export const updateUserProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      country,
      dateOfBirth,
      preferences
    } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Cet email est déjà utilisé par un autre compte" 
        });
      }
    }

    // Vérifier si le username est déjà utilisé
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Ce nom d'utilisateur est déjà pris" 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        email,
        firstName,
        lastName,
        phone,
        address,
        city,
        country,
        dateOfBirth,
        preferences: {
          ...req.user.preferences,
          ...preferences
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: updatedUser
    });
  } catch (error) {
    console.error('💥 Update user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// GET /api/user/ - Vos données existantes
export const getUserData = async (req, res) => {
  try {
    const role = req.user.role;
    const recentSearchedCities = req.user.recentSearchedCities;
    res.json({ success: true, role, recentSearchedCities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/recent-cities - Store recent searched cities
export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body;
    const user = req.user;

    if (!recentSearchedCity) {
      return res.status(400).json({
        success: false,
        message: "City is required"
      });
    }

    // Éviter les doublons
    if (!user.recentSearchedCities.includes(recentSearchedCity)) {
      if (user.recentSearchedCities.length < 3) {
        user.recentSearchedCities.push(recentSearchedCity);
      } else {
        user.recentSearchedCities.shift();
        user.recentSearchedCities.push(recentSearchedCity);
      }
      
      await user.save();
    }

    res.json({ 
      success: true, 
      message: "City added to recent searches",
      recentSearchedCities: user.recentSearchedCities
    });

  } catch (error) {
    console.error('💥 Store recent cities error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// GET /api/user/:id - Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('💥 Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};