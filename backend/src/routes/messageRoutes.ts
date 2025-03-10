import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getMessage, getUsersForSidebar, markMessagesAsRead, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/users" , protectRoute , getUsersForSidebar);

router.get("/:id" , protectRoute , getMessage);

router.post("/send/:id" , protectRoute , sendMessage);

router.put("/read/:id", protectRoute, markMessagesAsRead);
export default router;