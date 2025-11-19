import fs from "node:fs";
import path from "node:path";
import { and, eq, inArray, sql } from "drizzle-orm";
import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.js";
import { cartItems, items, orderItems, sellers, users } from "../db/schema.js";
import { __dirname as rootDirname } from "../index.js";
import { sendResponse, uploadToCloudinary } from "../utils/helpers.js";

const handleAddItem = async (req, res) => {
  const { name, description, category, price, stock } = req.body;
  let imageUrl = null;
  let imagePublicId = null;

  try {
    if (req.file) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const uploaded = await uploadToCloudinary(req.file.buffer, filename);
      imageUrl = uploaded.url;
      imagePublicId = uploaded.public_id;
    }

    const sellerId = req.session.user.id;

    const [result] = await db
      .insert(items)
      .values({
        name,
        description,
        category,
        price,
        stock,
        image_url: imageUrl,
        image_public_id: imagePublicId,
        seller_id: sellerId,
      })
      .execute();

    const item = {
      id: result.insertId,
      name,
      description,
      category,
      price,
      stock,
      image_url: imageUrl,
      image_public_id: imagePublicId,
      seller_id: sellerId,
    };

    return sendResponse(res, { item }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, "Server error", 500);
  }
};

const handleUpdateItem = async (req, res) => {
  const { itemId } = req.params;
  const { name, description, category, price, stock } = req.body;

  try {
    const updatedItem = await db.transaction(async (tx) => {
      const [existingItem] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId));

      if (!existingItem) {
        return sendResponse(res, null, "Item not found", 404);
      }

      let newImageUrl = null;
      let newImagePublicId = null;

      if (req.file) {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const uploaded = await uploadToCloudinary(req.file.buffer, filename);
        newImageUrl = uploaded.url;
        newImagePublicId = uploaded.public_id;

        if (existingItem.image_public_id) {
          try {
            await cloudinary.uploader.destroy(existingItem.image_public_id);
          } catch (destroyErr) {
            console.error("Failed to delete old Cloudinary image:", destroyErr);
            // continue — failure to destroy shouldn't block update
          }
        }
      }

      await tx
        .update(items)
        .set({
          name,
          description,
          category,
          price,
          stock,
          ...(newImageUrl && { image_url: newImageUrl }),
          ...(newImagePublicId && { image_public_id: newImagePublicId }),
        })
        .where(eq(items.id, itemId))
        .execute();

      const [updatedItem] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId));

      return updatedItem;
    });

    return sendResponse(res, { item: updatedItem }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, "Server error", 500);
  }
};

const handleDeleteItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    await db.transaction(async (tx) => {
      const [existingItem] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId));
      if (!existingItem) {
        return sendResponse(res, null, "Item not found", 404);
      }

      const [cartItem] = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.item_id, existingItem.id))
        .execute();

      if (cartItem) {
        throw new Error("Item is in someone's cart");
      }

      const [orderItem] = await tx
        .select()
        .from(orderItems)
        .where(
          and(
            eq(orderItems.item_id, existingItem.id),
            inArray(orderItems.status, [
              "Pending",
              "Processing",
              "Out for Delivery",
            ])
          )
        )
        .execute();

      if (orderItem) {
        throw new Error("Item is in someone's order");
      }

      if (existingItem.image_public_id) {
        try {
          await cloudinary.uploader.destroy(existingItem.image_public_id);
        } catch (err) {
          console.error("Failed to delete Cloudinary image:", err);
        }
      }

      await tx.delete(items).where(eq(items.id, itemId));
    });
    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getApprovedItems = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

  try {
    let query = db
      .select({
        item_id: items.id,
        name: items.name,
        category: items.category,
        price: items.price,
        stock: items.stock,
        description: items.description,
        seller_id: users.id,
        seller_name: users.full_name,
        seller_email: users.email,
        shop_name: sellers.shop_name,
        image_url: items.image_url,
      })
      .from(items)
      .innerJoin(sellers, eq(sellers.user_id, items.seller_id))
      .innerJoin(users, eq(users.id, sellers.user_id))
      .where(eq(items.status, "approved"));

    // Only apply limit if defined
    if (limit) {
      query = query.limit(limit);
    }

    const result = await query.execute();

    return sendResponse(res, { items: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getItemsBySellerId = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const result = await db.transaction(async (tx) => {
      const sellerItems = await tx
        .select({
          item_id: items.id,
          name: items.name,
          category: items.category,
          price: items.price,
          stock: items.stock,
          status: items.status,
          description: items.description,
        })
        .from(items)
        .innerJoin(sellers, eq(sellers.user_id, items.seller_id))
        .innerJoin(users, eq(users.id, sellers.user_id))
        .where(eq(items.seller_id, userId))
        .execute();
      return sellerItems;
    });

    return sendResponse(res, { items: result }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getMasterItems = async (req, res) => {
  try {
    const result = await db
      .select({
        item_id: items.id,
        name: items.name,
        category: items.category,
        description: items.description,
        seller_id: sellers.id,
        seller_name: users.full_name,
        seller_email: users.email,
        shop_name: sellers.shop_name,
        price: items.price,
        stock: items.stock,
        status: items.status,
      })
      .from(items)
      .innerJoin(sellers, eq(sellers.user_id, items.seller_id))
      .innerJoin(users, eq(users.id, sellers.user_id))
      .execute();
    return sendResponse(res, { items: result }, null, 200);
  } catch (error) {
    console.log(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const approveItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const updatedProduct = await db.transaction(async (tx) => {
      const [item] = await tx.select().from(items).where(eq(items.id, itemId));

      if (!item) throw new Error("Item not found");

      if (item.status === "approved") throw new Error("Item already approved");

      if (item.status === "rejected") throw new Error("Item already rejected");

      await tx
        .update(items)
        .set({ status: "approved" })
        .where(eq(items.id, itemId))
        .execute();

      const [approvedItem] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .execute();

      return approvedItem;
    });

    return sendResponse(res, { item: updatedProduct }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const rejectItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const updatedProduct = await db.transaction(async (tx) => {
      const [item] = await tx.select().from(items).where(eq(items.id, itemId));

      if (!item) throw new Error("Item not found");

      if (item.status === "approved") throw new Error("Item already approved");

      if (item.status === "rejected") throw new Error("Item already rejected");

      await tx
        .update(items)
        .set({ status: "rejected" })
        .where(eq(items.id, itemId))
        .execute();

      const [rejectedItem] = await tx
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .execute();

      return rejectedItem;
    });

    return sendResponse(res, { item: updatedProduct }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getItemsCountBySellerId = async (req, res) => {
  const userId = req.session.user.id;

  try {
    const result = await db
      .select({
        count: sql`CAST(COUNT(*) AS UNSIGNED)`.mapWith(Number),
      })
      .from(items)
      .where(and(eq(items.seller_id, userId), eq(items.status, "approved")));

    return sendResponse(res, { count: result[0]?.count || 0 }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

const getMasterItemsCount = async (req, res) => {
  try {
    const result = await db
      .select({
        count: sql`CAST(COUNT(*) AS UNSIGNED)`.mapWith(Number),
      })
      .from(items)
      .where(eq(items.status, "approved"));

    return sendResponse(res, { count: result[0]?.count || 0 }, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

export {
  handleAddItem,
  handleUpdateItem,
  handleDeleteItem,
  getApprovedItems,
  getItemsBySellerId,
  getMasterItems,
  approveItem,
  rejectItem,
  getItemsCountBySellerId,
  getMasterItemsCount,
};
