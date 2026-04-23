import { Router } from "express";
import { register, login, refresh, logout, getMe, updateProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.patch("/profile", authMiddleware, updateProfile);

export default router;
