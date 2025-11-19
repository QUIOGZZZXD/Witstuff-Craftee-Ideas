import session from "express-session";
import { environment } from "../constants/environment.js";
import { sessionStore } from "./db.js";

const isProduction = environment.NODE_ENV === "production";

export const sessionMiddleware = session({
	secret: environment.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		secure: isProduction,
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24,
	},
});
