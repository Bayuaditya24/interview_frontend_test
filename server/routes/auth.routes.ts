import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;
