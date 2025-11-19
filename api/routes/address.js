import express from "express";
import { getBillingAddress, getBillingAddressByUserId, updateBillingAddressByUserId } from "../controllers/address.js";

const router = express.Router();

router.post("/", updateBillingAddressByUserId);
router.get("/", getBillingAddress);
router.get("/self", getBillingAddressByUserId);

export default router;