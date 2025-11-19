import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { isGuest, pageGuard } from "../middlewares/page-guard.js";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { sellers } from "../db/schema.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.join(__dirname, "../../client");

const send = (res, relative) => res.sendFile(path.join(base, relative));

router.get("/redirect", async(req, res) => {
  const user = req.session.user;
  switch (user.role) {
      case "admin":
        return res.redirect("/admin/dashboard");
      case "seller": {
        const [seller] = await db
          .select()
          .from(sellers)
          .where(eq(sellers.user_id, user.id));
        req.session.user = {
          ...user,
          seller_id: seller.id,
          shop_name: seller.shop_name,
        };
        return res.redirect("/seller/dashboard");
      }
      default:
        return res.redirect("/me");
    }
})
router.get("/", (_, res) => send(res, "public/index.html"));
router.get("/shop", (_, res) => send(res, "public/shop.html"));
router.get("/login", isGuest, (_, res) => send(res, "public/login.html"));
router.get("/register", isGuest, (_, res) => send(res, "public/register.html"));
router.get("/seller/register", isGuest, (_, res) => send(res, "public/register-seller.html"));

router.get("/cart", pageGuard(['*']), (_, res) => send(res, "protected/customer/cart.html"));
router.get("/contact", (_, res) => send(res, "public/contact.html"));
router.get("/about", (_, res) => send(res, "public/about.html"));
router.get("/billing-address", pageGuard(['*']), (_, res) => send(res, "protected/customer/billing-address.html"));

router.get("/orders", pageGuard(['*']), (_, res) => send(res, "protected/customer/order.html"));

router.get("/me", pageGuard(["*"]), (_, res) => send(res, "protected/customer/me.html"));


router.get("/admin/dashboard", pageGuard(["admin"]), (_, res) => send(res, "protected/admin/dashboard.html"));

router.get("/admin/manage-sellers", pageGuard(["admin"]), (_, res) =>
  send(res, "protected/admin/manage-sellers.html")
);
router.get("/admin/manage-products", pageGuard(["admin"]), (_, res) =>
  send(res, "protected/admin/manage-products.html")
);
router.get("/admin/manage-orders", pageGuard(["admin"]), (_, res) =>
  send(res, "protected/admin/manage-orders.html")
);

router.get("/seller/dashboard", pageGuard(["seller"]), (_, res) =>
  send(res, "protected/seller/dashboard.html")
);
router.get("/seller/manage-products", pageGuard(["seller"]), (_, res) =>
  send(res, "protected/seller/manage-products.html")
);
router.get("/seller/manage-orders", pageGuard(["seller"]), (_, res) =>
  send(res, "protected/seller/manage-orders.html")
);

export default router;
