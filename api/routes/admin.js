import express from "express";
import { getMasterMonthlySalesTrends, getMasterSales, getRecentOrderItems } from "../controllers/admin.js";
import {
  approveItem,
  getMasterItems,
  getMasterItemsCount,
  rejectItem,
} from "../controllers/item.js";
import {
  getMasterOrderItems,
  getMasterOrderItemsCount,
} from "../controllers/order-item.js";

const router = express.Router();

router.get("/order-items", getMasterOrderItems);
router.get("/items", getMasterItems);
router.patch("/items/:itemId/approve", approveItem);
router.patch("/items/:itemId/reject", rejectItem);

router.get("/sales", getMasterSales);
router.get("/order-items/count", getMasterOrderItemsCount);
router.get("/items/count", getMasterItemsCount);

router.get("/monthly-sales-trends", getMasterMonthlySalesTrends)

router.get("/order-items/recent", getRecentOrderItems);

export default router;
