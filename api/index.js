import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { sessionMiddleware } from "./config/session.js";
import { environment } from "./constants/environment.js";
import { keepAlive } from "./cron/keep-alive.js";
import {
	adminRoutes,
	authRoutes,
	cartRoutes,
	contactMessageRoutes,
	itemRoutes,
	orderItemRoutes,
	pagesRoutes,
	sellerRoutes,
	userAddressRoutes,
} from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, "../client")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/hello-world", (_, res) => {
	res.send("Hello World!");
});

app.use("/api/contact-messages", contactMessageRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/billing-address", userAddressRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/", pagesRoutes);

const port = process.env.PORT || 3000;

app.listen(port, async () => {
	console.log(`Server running on port ${port}`);
});

if (environment.KEEP_ALIVE) {
	keepAlive();
}
