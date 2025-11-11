import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { 
    createRoom, 
    getOwnerRooms, 
    getRooms, 
    toggleRoomAvailability, 
    deleteRoom,
    getRoomById,
    updateRoom
} from "../controllers/roomController.js";

const roomRouter = express.Router();

// Public routes
roomRouter.get('/', getRooms);
roomRouter.get('/:roomId', getRoomById);

// Protected routes (require authentication)
roomRouter.post('/', upload.array("images", 4), protect, createRoom);
roomRouter.get('/owner/all', protect, getOwnerRooms);
roomRouter.post('/toggle-availability', protect, toggleRoomAvailability);
roomRouter.delete('/:roomId', protect, deleteRoom);
roomRouter.put('/:roomId', upload.array("images", 4), protect, updateRoom);

export default roomRouter;