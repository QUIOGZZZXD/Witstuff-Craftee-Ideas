import express from "express";
import {
  getOrderItemsByUserId,
  handleCancelOrderItem,
  handleCheckoutCartItems,
  handleDirectCheckout,
  updateOrderItemStatus,
} from "../controllers/order-item.js";

const router = express.Router();

router.get("/", getOrderItemsByUserId);
router.post("/", handleCheckoutCartItems);
router.post("/direct-checkout", handleDirectCheckout);
router.patch("/", handleCancelOrderItem);

router.patch("/:orderItemId/status", updateOrderItemStatus);

export default router;
