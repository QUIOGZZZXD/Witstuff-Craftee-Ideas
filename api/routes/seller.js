import express from "express";
import {
  getItemsBySellerId,
  getItemsCountBySellerId,
  handleAddItem,
} from "../controllers/item.js";
import {
  getOrderItemsBySellerId,
  getOrderItemsCountBySellerId,
} from "../controllers/order-item.js";
import {
  getMasterSellers,
  getMonthlySalesTrends,
  getRecentOrderItemsBySellerId,
  getSalesBySellerId,
  handleAddSeller,
  handleDeleteSeller,
  handleUpdateSeller,
} from "../controllers/seller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post("/items", upload.single("image"), handleAddItem);
router.get("/items", getItemsBySellerId);
router.get("/order-items", getOrderItemsBySellerId);
router.delete("/:userId", handleDeleteSeller);
router.put("/:userId", handleUpdateSeller);
router.get("/", getMasterSellers);
router.post("/", handleAddSeller);

router.get("/sales", getSalesBySellerId);
router.get("/order-items/count", getOrderItemsCountBySellerId);
router.get("/items/count", getItemsCountBySellerId);

router.get("/monthly-sales-trends", getMonthlySalesTrends)

router.get("/order-items/recent", getRecentOrderItemsBySellerId);

export default router;
