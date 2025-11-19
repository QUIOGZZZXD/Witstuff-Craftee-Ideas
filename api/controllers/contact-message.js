import { db } from "../config/db.js";
import { contactMessages } from "../db/schema.js";
import { sendResponse } from "../utils/helpers.js";

const handleAddContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message)
    return sendResponse(res, null, "Invalid fields", 400);

  try {
    await db.insert(contactMessages).values({ name, email, subject, message });
    return sendResponse(res, null, null, 200);
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

export { handleAddContactMessage };
