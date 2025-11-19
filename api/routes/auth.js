import express from "express";
import {
	checkSession,
	handleLogin,
	handleLogout,
	handleRegister,
	handleSellerRegister,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/login", handleLogin);

router.post("/register", handleRegister);

router.post("/seller/register", handleSellerRegister);

router.post("/logout", handleLogout);

router.get("/check-session", checkSession)

export default router;
