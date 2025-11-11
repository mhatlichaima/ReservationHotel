// controllers/faceAuthController.js - VERSION CORRIGÉE
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// 🔹 Enregistrer le visage d'un utilisateur
export const registerFace = async (req, res) => {
  try {
    const { userId, faceDescriptor } = req.body;

    if (!userId || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: "User ID and face descriptor are required",
      });
    }

    // Mettre à jour l'utilisateur avec le descripteur facial
    const user = await User.findByIdAndUpdate(
      userId,
      {
        faceDescriptor: faceDescriptor,
        faceRegistered: true,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Face registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        faceRegistered: user.faceRegistered,
      },
    });
  } catch (error) {
    console.error("Face registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register face",
    });
  }
};

// 🔹 Connexion par reconnaissance faciale
export const loginWithFace = async (req, res) => {
  try {
    const { email, faceDescriptor } = req.body;

    if (!email || !faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({
        success: false,
        message: "Email and face descriptor are required",
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.faceRegistered || !user.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Face not registered for this account",
      });
    }

    // 🔥 CALCUL DE DISTANCE SIMPLIFIÉ (sans face-api.js)
    const distance = euclideanDistance(faceDescriptor, user.faceDescriptor);
    
    // Seuil de similarité (plus petit = plus similaire)
    const threshold = 0.6;

    if (distance > threshold) {
      return res.status(401).json({
        success: false,
        message: "Face does not match",
        distance: distance,
      });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.image,
      faceRegistered: user.faceRegistered,
      recentSearchedCities: user.recentSearchedCities,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
      matchDistance: distance,
    });
  } catch (error) {
    console.error("Face login error:", error);
    res.status(500).json({
      success: false,
      message: "Face login failed",
    });
  }
};

// 🔹 Vérifier si l'utilisateur a enregistré son visage
export const checkFaceRegistration = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email: email.toLowerCase() }).select("faceRegistered email username");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      faceRegistered: user.faceRegistered || false,
      user: {
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error("Check face registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check face registration",
    });
  }
};

// 🔥 FONCTION UTILITAIRE POUR CALCULER LA DISTANCE
function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) {
    return Infinity; // Distance infinie si incompatibles
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}