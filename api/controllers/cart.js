import { and, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { cartItems, items, sellers, users } from "../db/schema.js";
import { sendResponse } from "../utils/helpers.js";

const getCartItems = async (req, res) => {
	try {
		const userId = req.session.user.id;
		const result = await db
			.select({
				id: cartItems.id,
				item_name: items.name,
				price: items.price,
				quantity: cartItems.quantity,
				shop_name: sellers.shop_name,
				seller_email: users.email,
				seller_name: users.full_name,
				seller_id: users.id,
				image_url: items.image_url,
			})
			.from(cartItems)
			.where(eq(cartItems.user_id, userId))
			.innerJoin(items, eq(items.id, cartItems.item_id))
			.innerJoin(sellers, eq(sellers.user_id, items.seller_id))
			.innerJoin(users, eq(users.id, sellers.user_id));

		return sendResponse(res, { cart_items: result }, null, 200);
	} catch (error) {
		console.error(error);
		return sendResponse(res, null, "Server error", 500);
	}
};

const handleAddToCart = async (req, res) => {
	const { item_id, quantity } = req.body;

	try {
		await db.transaction(async (tx) => {
			const userId = req.session.user.id;

			// Check if item exists
			const [item] = await tx.select().from(items).where(eq(items.id, item_id));
			if (!item) throw new Error("Item not found");
			if (item.stock < quantity) throw new Error("Not enough stock");

			// Check if cart item already exists for this user
			const [existingCartItem] = await tx
				.select()
				.from(cartItems)
				.where(and(eq(cartItems.user_id, userId), eq(cartItems.item_id, item_id)));

			if (existingCartItem) {
				// Update quantity
				const newQuantity = existingCartItem.quantity + quantity;

				if (newQuantity > item.stock)
					throw new Error("Quantity exceeds available stock");

				await tx
					.update(cartItems)
					.set({ quantity: newQuantity })
					.where(eq(cartItems.id, existingCartItem.id));
			} else {
				// Insert new record
				await tx.insert(cartItems).values({
					user_id: userId,
					item_id: item.id,
					quantity,
				});
			}
		});

		return sendResponse(res, null, null, 200);
	} catch (error) {
		console.error(error);
		return sendResponse(res, null, error.message || "Server error", 500);
	}
};


const handleDeleteCartItem = async (req, res) => {
	const { cartItemId } = req.params;
	try {
		await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
		return res.sendStatus(200);
	} catch (error) {
		console.error(error);
		return sendResponse(res, null, "Server error", 500);
	}
};

const updateCartItems = async (req, res) => {
  try {
    const { items: cartUpdates } = req.body; // items: [{ cartItemId: number, quantity: number }, ...]

    if (!Array.isArray(cartUpdates) || cartUpdates.length === 0)
      return sendResponse(res, null, "No items provided", 400);

    const userId = req.session.user.id; 

    await db.transaction(async (tx) => {
      for (const { cartItemId, quantity } of cartUpdates) {
        if (quantity < 1) continue; // skip invalid quantities

        // fetch cart item and corresponding item stock
        const [cartItem] = await tx
          .select({ item_id: cartItems.item_id })
          .from(cartItems)
          .where(and(eq(cartItems.id, cartItemId), eq(cartItems.user_id, userId)));

        if (!cartItem) continue;

        const [item] = await tx.select({ stock: items.stock }).from(items).where(eq(items.id, cartItem.item_id));
        if (!item) continue;

        if (quantity > item.stock) {
          throw new Error(`Cannot set quantity higher than stock (${item.stock})`);
        }

        await tx
          .update(cartItems)
          .set({ quantity })
          .where(and(eq(cartItems.id, cartItemId), eq(cartItems.user_id, userId)));
      }
    });

    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};



export { handleAddToCart, handleDeleteCartItem, getCartItems, updateCartItems };
