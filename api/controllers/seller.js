import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { orderItems, orders, sellers, users } from "../db/schema.js";
import { hashPassword, sendResponse } from "../utils/helpers.js";

const handleDeleteSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    await db.transaction(async (tx) => {
      await tx.delete(sellers).where(eq(sellers.user_id, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, "Server error", 500);
  }
};

const handleUpdateSeller = async (req, res) => {
  try {
    const { userId } = req.params;

    const { shop_name, full_name, status } = req.body;
    await db.transaction(async (tx) => {
      await tx
        .update(sellers)
        .set({
          shop_name: shop_name || sellers.shop_name,
          status: status || sellers.status,
        })
        .where(eq(sellers.user_id, userId));

      await tx
        .update(users)
        .set({ full_name: full_name || users.full_name })
        .where(eq(users.id, userId));
    });

    const [updatedSeller] = await db
      .select({
        user_id: users.id,
        email: users.email,
        full_name: users.full_name,
        seller_id: sellers.id,
        shop_name: sellers.shop_name,
        status: sellers.status,
      })
      .from(users)
      .where(eq(users.id, userId))
      .innerJoin(sellers, eq(sellers.user_id, users.id));

    return sendResponse(res, { seller: updatedSeller }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, "Server error", 500);
  }
};

const getMasterSellers = async (req, res) => {
  try {
    const result = await db
      .select({
        user_id: users.id,
        email: users.email,
        full_name: users.full_name,
        seller_id: sellers.id,
        shop_name: sellers.shop_name,
        status: sellers.status,
      })
      .from(users)
      .innerJoin(sellers, eq(sellers.user_id, users.id))
      .execute();
    return sendResponse(res, { sellers: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const handleAddSeller = async (req, res) => {
  try {
    const { email, password, confirm_password, shop_name } = req.body;
    if (!email || !password)
      return sendResponse(res, null, "Invalid fields", 400);

    if (password.length < 6)
      return sendResponse(
        res,
        null,
        "Password must be at least 6 characters",
        400
      );

    if (password !== confirm_password)
      return sendResponse(res, null, "Passwords do not match", 400);

    // check if email exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0)
      return sendResponse(res, null, "Email already registered", 400);

    const hashed = await hashPassword(password);

    await db.transaction(async (tx) => {
      const result = await tx.insert(users).values({
        email,
        password: hashed,
        full_name: email.split("@")[0],
        role: "seller",
      });

      const newUserId = result[0].insertId;

      await tx.insert(sellers).values({
        user_id: newUserId,
        shop_name,
        status: "active",
      });
    });

    // no data and error
    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getSalesBySellerId = async (req, res) => {
  const userId = req.session.user.id

  try {
    const result = await db
      .select({
        total_sales: sql`SUM(${orderItems.subtotal})`.mapWith(Number),
      })
      .from(orderItems)
      .where(
        sql`${orderItems.seller_id} = ${userId} AND ${orderItems.status} IN ('Out for Delivery', 'Delivered')`
      );

    const totalSales = result[0]?.total_sales || 0;

    return sendResponse(res, { total_sales: totalSales }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getMonthlySalesTrends = async (req, res) => {
  const userId = req.session.user.id
  try {
    const result = await db
      .select({
        month: sql`MONTH(${orderItems.created_at})`.mapWith(Number),
        total_sales: sql`SUM(${orderItems.subtotal})`.mapWith(Number),
      })
      .from(orderItems)
      .where(
        and(
          eq(orderItems.seller_id, userId),
          inArray(orderItems.status, ["Out for Delivery", "Delivered"])
        )
      )
      .groupBy(sql`MONTH(${orderItems.created_at})`)
      .orderBy(sql`MONTH(${orderItems.created_at})`);

    return sendResponse(res, { monthly_sales_trends: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getRecentOrderItemsBySellerId = async (req, res) => {
  const userId = req.session.user.id
  try {
    const result = await db
      .select({
        id: orderItems.id,
        status: orderItems.status,
        subtotal: orderItems.subtotal,
        created_at: orderItems.created_at,
        customer_name: users.full_name,
      })
      .from(orderItems)
      .where(eq(orderItems.seller_id, userId))
      .leftJoin(orders, eq(orderItems.order_id, orders.id))
      .leftJoin(users, eq(orders.customer_id, users.id))
      .limit(3)
      .orderBy(desc(orderItems.created_at));

    return sendResponse(res, { recent_order_items: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

export {
  handleDeleteSeller,
  handleUpdateSeller,
  getMasterSellers,
  handleAddSeller,
  getSalesBySellerId,
  getMonthlySalesTrends,
  getRecentOrderItemsBySellerId
};
