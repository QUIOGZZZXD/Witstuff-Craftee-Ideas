import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { orderItems, orders, users } from "../db/schema.js";
import { sendResponse } from "../utils/helpers.js";

const getMasterSales = async (req, res) => {
  try {
    const result = await db
      .select({
        total_sales: sql`SUM(${orderItems.subtotal})`.mapWith(Number),
      })
      .from(orderItems)
      .where(inArray(orderItems.status, ["Out for Delivery", "Delivered"]));

    const totalSales = result[0]?.total_sales || 0;

    return sendResponse(res, { total_sales: totalSales }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getMasterMonthlySalesTrends = async (req, res) => {
  try {
    const result = await db
      .select({
        month: sql`MONTH(${orderItems.created_at})`.mapWith(Number),
        total_sales: sql`SUM(${orderItems.subtotal})`.mapWith(Number),
      })
      .from(orderItems)
      .where(inArray(orderItems.status, ["Out for Delivery", "Delivered"]))
      .groupBy(sql`MONTH(${orderItems.created_at})`)
      .orderBy(sql`MONTH(${orderItems.created_at})`);

    return sendResponse(res, { monthly_sales_trends: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getRecentOrderItems = async (req, res) => {
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

export { getMasterSales, getMasterMonthlySalesTrends, getRecentOrderItems };
