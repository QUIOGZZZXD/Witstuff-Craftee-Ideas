import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { userAddresses } from "../db/schema.js";
import { sendResponse } from "../utils/helpers.js";

const updateBillingAddressByUserId = async (req, res) => {
    try {
        const { street, city, province, postal_code } = req.body;
        const user_id = req.session.user.id

        const result = await db.transaction(async (tx) => {
            const existed = await tx
                .select()
                .from(userAddresses)
                .where(eq(userAddresses.id, user_id))
                .execute();

            if (existed.length === 0) {
                await tx.insert(userAddresses).values({
                    user_id,
                    street,
                    city,
                    province,
                    postal_code
                }).execute();
            } else {
                await tx.update(userAddresses)
                    .set({
                        street,
                        city,
                        province,
                        postal_code
                    }).where(eq(userAddresses.user_id, user_id))
                    .execute();
            }

            const [updated] = await tx
                .select()
                .from(userAddresses)
                .where(eq(userAddresses.id, user_id))
                .execute();

            return updated;
        });



        return sendResponse(res, { billing_address: result }, null, 200);
    } catch (error) {
        console.error(error);
        return sendResponse(res, null, error.message || "Server error", 500);
    }
}

const getBillingAddress = async (req, res) => {
    const address = await db.select().from(userAddresses).execute();

    return sendResponse(res, { billing_address: address }, null, 200);
}

const getBillingAddressByUserId = async (req, res) => {
    const user_id = req.session.user.id
    const [address] = await db.select().from(userAddresses).where(eq(userAddresses.user_id, user_id)).execute();

    return sendResponse(res, { billing_address: address || null }, null, 200);
}

export {
    updateBillingAddressByUserId,
    getBillingAddress,
    getBillingAddressByUserId
}