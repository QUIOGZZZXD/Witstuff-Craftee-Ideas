import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { sellers, users } from "../db/schema.js";
import { hashPassword, sendResponse } from "../utils/helpers.js";

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendResponse(res, null, "Missing credentials", 400);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        full_name: users.full_name,
        role: users.role,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email));
    if (!user) return sendResponse(res, null, "Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return sendResponse(res, null, "Invalid credentials", 401);

    req.session.user = user;
    // role detection
    switch (user.role) {
      case "admin":
        return sendResponse(res, { redirect: "/admin/dashboard" });
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
        return sendResponse(res, { redirect: "/seller/dashboard" });
      }
      default:
        return sendResponse(res, { redirect: "/me" });
    }
  } catch (err) {
    console.error(err);
    return sendResponse(res, null, "Server error", 500);
  }
};

const handleRegister = async (req, res) => {
  try {
    const { email, password, confirm_password } = req.body;
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

    await db.insert(users).values({
      email,
      password: hashed,
      full_name: email.split("@")[0],
      role: "customer",
    });

    // no data and error
    return sendResponse(res, null, null, 200);
  } catch (err) {
    console.error(err);
    return sendResponse(res, null, "Server error", 500);
  }
};

const handleSellerRegister = async (req, res) => {
  try {
    const { email, password, confirm_password, shop_name } = req.body;

    if (!email || !password || !shop_name)
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
  } catch (err) {
    console.error(err);
    return sendResponse(res, null, "Server error", 500);
  }
};

const handleLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};

const checkSession = (req, res) => {
  try {
    const loggedIn = !!req.session?.user; // true if session exists

    return sendResponse(res, { loggedIn });
  } catch (error) {
    console.error(error);
    return sendResponse(res, null, error.message || "Server error", 500);
  }
};

export { handleLogin, handleRegister, handleSellerRegister, handleLogout, checkSession };
