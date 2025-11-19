import express from "express";
import { handleAddContactMessage } from "../controllers/contact-message.js";

const router = express.Router();

router.post("/", handleAddContactMessage);

export default router;
