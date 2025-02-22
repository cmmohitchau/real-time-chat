import express , { Router } from "express";
import { Signin , Logout, Signup , updateProfile, checkAuth} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
const router = Router();

router.post("/signup" , Signup);

router.post("/signin" , Signin);

router.post("/logout" , Logout);

router.put("/update-profile" , protectRoute , updateProfile);

router.get("/check" , protectRoute , checkAuth);
export default router;
