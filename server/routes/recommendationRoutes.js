import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRecommendations, trainModel } from "../controllers/recommendationController.js";

const recommendationRouter = express.Router();

// Route pour obtenir des recommandations personnalisées
recommendationRouter.post('/', protect, getRecommendations);

// Route admin pour réentraîner le modèle (optionnel)
recommendationRouter.post('/train', protect, trainModel);

export default recommendationRouter;