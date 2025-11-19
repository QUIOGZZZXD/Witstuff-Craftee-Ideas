import express from "express";
import {
  getCartItems,
  handleAddToCart,
  handleDeleteCartItem,
  updateCartItems,
} from "../controllers/cart.js";

const router = express.Router();

router.get("/", getCartItems);
router.post("/", handleAddToCart);
router.delete("/:cartItemId", handleDeleteCartItem);
router.put("/", updateCartItems)

export default router;
