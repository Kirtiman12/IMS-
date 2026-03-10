import { Router } from "express";
import { login, logout, refresh, getMe, register } from "@/controllers/auth.controller";
import { authenticate } from "@/middleware/authenticate";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/logout",  logout);
router.get ("/me",      authenticate, getMe);

export default router;
