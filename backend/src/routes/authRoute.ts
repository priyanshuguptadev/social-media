import { Router } from "express";

import { login, register, getMe } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.post("/login", login);
router.post("/register", register);

export default router;
