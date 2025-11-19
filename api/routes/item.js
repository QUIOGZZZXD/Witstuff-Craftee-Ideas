import express from "express";
import {
	getApprovedItems,
	handleDeleteItem,
	handleUpdateItem,
} from "../controllers/item.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getApprovedItems);
router.put("/:itemId", upload.single("image"), handleUpdateItem);
router.delete("/:itemId", handleDeleteItem);

export default router;
