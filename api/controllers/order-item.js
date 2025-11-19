import { and, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { db } from "../config/db.js";
import {
  cartItems,
  items,
  ORDER_ITEM_STATUSES,
  orderItems,
  orders,
  sellers,
  users,
} from "../db/schema.js";
import { sendResponse } from "../utils/helpers.js";

const handleCheckoutCartItems = async (req, res) => {
  const userId = req.session.user.id;
  const { payment_method, selected_cart_item_ids } = req.body;

  if (
    !selected_cart_item_ids ||
    !Array.isArray(selected_cart_item_ids) ||
    selected_cart_item_ids.length === 0
  )
    return sendResponse(res, null, "No cart items selected", 400);

  try {
    await db.transaction(async (tx) => {
      // 1. Fetch only the selected cart items
      const selected = await tx
        .select({
          cartId: cartItems.id,
          itemId: items.id,
          sellerId: items.seller_id,
          price: items.price,
          quantity: cartItems.quantity,
        })
        .from(cartItems)
        .innerJoin(items, eq(cartItems.item_id, items.id))
        .where(inArray(cartItems.id, selected_cart_item_ids.map(Number)));

      if (selected.length === 0) throw new Error("No valid cart items found");

      // 2. Calculate order total
      const total = selected.reduce(
        (sum, c) => sum + Number(c.price) * c.quantity,
        0
      );

      // 3. Create order
      const [order] = await tx
        .insert(orders)
        .values({
          customer_id: userId,
          payment_method,
          total_price: total,
        })
        .execute();

      const orderId = order.insertId;

      // 4. Insert order_items
      for (const c of selected) {
        await tx.insert(orderItems).values({
          seller_id: c.sellerId,
          order_id: orderId,
          item_id: c.itemId,
          quantity: c.quantity,
          price: c.price,
          subtotal: sql`${c.price} * ${c.quantity}`.mapWith(Number),
        });
      }

      // 5. Remove only checked-out cart items
      await tx
        .delete(cartItems)
        .where(inArray(cartItems.id, selected_cart_item_ids.map(Number)));

      // 6. Deduct the stock
      for (const c of selected) {
        await tx
          .update(items)
          .set({ stock: sql`${items.stock} - ${c.quantity}` })
          .where(eq(items.id, c.itemId));
      }
    });

    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getOrderItemsByUserId = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const sellerUsers = alias(users, "seller_users");

    const result = await db
      .select({
        order_id: orderItems.order_id,
        order_item_id: orderItems.id,
        item_name: items.name,
        unit_price: orderItems.price,
        quantity: orderItems.quantity,
        status: orderItems.status,
        total_price: orderItems.subtotal,
        shop_name: sellers.shop_name,
        seller_email: sellerUsers.email,
        seller_name: sellerUsers.full_name,
        seller_id: sellers.id,
        image_url: items.image_url,
      })
      .from(orderItems)
      .innerJoin(items, eq(items.id, orderItems.item_id))
      .innerJoin(sellers, eq(sellers.user_id, items.seller_id))
      .innerJoin(sellerUsers, eq(sellerUsers.id, sellers.user_id))
      .innerJoin(orders, eq(orders.id, orderItems.order_id))
      .where(eq(orders.customer_id, userId))
      .execute();

    return sendResponse(res, { order_items: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};



const handleCancelOrderItem = async (req, res) => {
  const { order_id, item_id } = req.body;

  try {
    const [orderItem] = await db
      .select()
      .from(orderItems)
      .where(
        and(eq(orderItems.order_id, order_id), eq(orderItems.item_id, item_id))
      )
      .execute();

    if (!orderItem) {
      return sendResponse(res, null, "Order item not found", 404);
    }

    if (orderItem.status === "Cancelled") {
      return sendResponse(res, null, "Order item already cancelled", 400);
    }

    if (
      orderItem.status === "Out for Delivery" ||
      orderItem.status === "Delivered"
    ) {
      return sendResponse(res, null, "Order item cannot be cancelled", 400);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(orderItems)
        .set({ status: "Cancelled" })
        .where(
          and(
            eq(orderItems.order_id, order_id),
            eq(orderItems.item_id, item_id)
          )
        );

      await tx
        .update(items)
        .set({ stock: sql`${items.stock} + ${orderItem.quantity}` })
        .where(eq(items.id, orderItem.item_id));
    });

    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const handleDirectCheckout = async (req, res) => {
  const userId = req.session.user.id;

  const { item_id, quantity, payment_method } = req.body;

  try {
    await db.transaction(async (tx) => {
      const [item] = await tx.select().from(items).where(eq(items.id, item_id));

      if (!item) throw new Error("Item not found");

      if (item.stock < quantity) throw new Error("Not enough stock");

      const [order] = await tx
        .insert(orders)
        .values({
          customer_id: userId,
          payment_method,
          total_price: item.price * quantity,
        })
        .execute();

      await tx.insert(orderItems).values({
        seller_id: item.seller_id,
        order_id: order.insertId,
        item_id: item.id,
        quantity,
        price: item.price,
        subtotal: item.price * quantity,
      });

      await tx
        .update(items)
        .set({ stock: sql`${items.stock} - ${quantity}` })
        .where(eq(items.id, item_id));
    });

    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getOrderItemsBySellerId = async (req, res) => {

  const userId = req.session.user.id;
  try {
    let result = [];

    await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .execute();

      console.log("no user: ", user);
      if (!user) throw new Error("Seller not found");

      result = await tx
        .select({
          order_item_id: orderItems.id,
          order_id: orders.id,
          item_id: orderItems.item_id,
          customer_id: orders.customer_id,
          quantity: orderItems.quantity,
          price: orderItems.price,
          total_price: orderItems.subtotal,
          status: orderItems.status,
          payment_method: orders.payment_method,
          date: orderItems.created_at,
          customer_full_name: users.full_name,
          customer_email: users.email,
          item_name: items.name,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.order_id))
        .innerJoin(users, eq(users.id, orders.customer_id))
        .innerJoin(items, eq(items.id, orderItems.item_id))
        .where(eq(orderItems.seller_id, user.id))
        .execute();
    });

    return sendResponse(res, { order_items: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getMasterOrderItems = async (req, res) => {
  try {
    const sellerUsers = alias(users, "seller_users");

    const result = await db
      .select({
        order_item_id: orderItems.id,
        order_id: orders.id,
        item_id: orderItems.item_id,
        customer_id: orders.customer_id,
        seller_id: items.seller_id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        total_price: orderItems.subtotal,
        status: orderItems.status,
        payment_method: orders.payment_method,
        date: orderItems.created_at,
        customer_full_name: users.full_name,
        customer_email: users.email,
        item_name: items.name,
        seller_name: sellerUsers.full_name,
        seller_email: sellerUsers.email,
        shop_name: sellers.shop_name,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.order_id))
      .innerJoin(users, eq(users.id, orders.customer_id))
      .innerJoin(items, eq(items.id, orderItems.item_id))
      .innerJoin(sellers, eq(sellers.user_id, items.seller_id))
      .innerJoin(sellerUsers, eq(sellerUsers.id, sellers.user_id))
      .execute();

    return sendResponse(res, { order_items: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const updateOrderItemStatus = async (req, res) => {
  const { orderItemId } = req.params;
  const { status } = req.body;

  console.log('selected status:', status);

  try {
    const updatedOrderItem = await db.transaction(async (tx) => {
      const [orderItem] = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.id, orderItemId))
        .execute();

      if (!orderItem) throw new Error("Order item not found");

      if (!ORDER_ITEM_STATUSES.includes(status))
        throw new Error("Invalid status");

      await tx
        .update(orderItems)
        .set({ status })
        .where(eq(orderItems.id, orderItemId))
        .execute();

      const [updated] = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.id, orderItemId))
        .execute();

      return updated;
    });

    return sendResponse(res, { order_item: updatedOrderItem }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getOrderItemsCountBySellerId = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const result = await db
      .select({
        count: sql`CAST(COUNT(*) AS UNSIGNED)`.mapWith(Number),
      })
      .from(orderItems)
      .where(eq(orderItems.seller_id, userId));

    return sendResponse(res, { count: result[0]?.count || 0 }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getMasterOrderItemsCount = async (req, res) => {
  try {
    const result = await db
      .select({
        count: sql`CAST(COUNT(*) AS UNSIGNED)`.mapWith(Number),
      })
      .from(orderItems);

    return sendResponse(res, { count: result[0]?.count || 0 }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

export {
  handleCheckoutCartItems,
  getOrderItemsByUserId,
  handleCancelOrderItem,
  handleDirectCheckout,
  getOrderItemsBySellerId,
  getMasterOrderItems,
  updateOrderItemStatus,
  getOrderItemsCountBySellerId,
  getMasterOrderItemsCount,
};
