import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getUserProfile, 
  getUserData, 
  storeRecentSearchedCities,
  getUserById,
  updateUserProfile  // NOUVELLE IMPORTATION
} from "../controllers/userController.js";

const userRouter = express.Router();

// GET /api/user/profile - Profile de l'utilisateur connecté
userRouter.get('/profile', protect, getUserProfile);

// PUT /api/user/profile - Mettre à jour le profil
userRouter.put('/profile', protect, updateUserProfile);

// GET /api/user/ - Données utilisateur (role et villes récentes)
userRouter.get('/', protect, getUserData);

// POST /api/user/recent-cities - Stocker les villes recherchées
userRouter.post('/recent-cities', protect, storeRecentSearchedCities);

// GET /api/user/:id - Obtenir un utilisateur par ID
userRouter.get('/:id', protect, getUserById);

export default userRouter;