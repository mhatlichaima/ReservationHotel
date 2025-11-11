import express from "express";
import {
  registerFace,
  loginWithFace,
  checkFaceRegistration,
} from "../controllers/faceAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Enregistrer le visage (nécessite authentification)
router.post("/register-face", protect, registerFace);

// Connexion par reconnaissance faciale
router.post("/login-face", loginWithFace);

// Vérifier si le visage est enregistré
router.get("/check-face", checkFaceRegistration);

export default router;