import {
	decimal,
	int,
	mysqlEnum,
	mysqlTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/mysql-core";

const USER_ROLES = ["admin", "seller", "customer"];
const SELLER_STATUSES = ["active", "inactive"];
const ITEM_STATUSES = ["approved", "pending", "rejected"];
const PAYMENT_METHODS = ["COD", "GCash"];
export const ORDER_ITEM_STATUSES = [
	"Pending",
	"Processing",
	"Out for Delivery",
	"Delivered",
	"Cancelled",
];

export const users = mysqlTable("users", {
	id: int("id").primaryKey().autoincrement(),
	email: varchar("email", { length: 100 }).notNull().unique(),
	password: varchar("password", { length: 255 }).notNull(),
	full_name: varchar("full_name", { length: 100 }).notNull(),
	role: mysqlEnum("role", USER_ROLES).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const sellers = mysqlTable("sellers", {
	id: int("id").primaryKey().autoincrement(),
	user_id: int("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	shop_name: varchar("shop_name", { length: 100 }).notNull(),
	status: mysqlEnum("status", SELLER_STATUSES).notNull().default("active"),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const userAddresses = mysqlTable("user_address", {
	id: int("id").primaryKey().autoincrement(),
	user_id: int("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	province: varchar("province", { length: 100 }),
	city: varchar("city", { length: 100 }),
	street: varchar("street", { length: 100 }),
	postal_code: varchar("postal_code", { length: 100 }),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = mysqlTable("contact_messages", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 100 }).notNull(),
	email: varchar("email", { length: 100 }).notNull(),
	subject: varchar("subject", { length: 100 }).notNull(),
	message: varchar("message", { length: 1000 }).notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const items = mysqlTable("items", {
	id: int("id").primaryKey().autoincrement(),
	name: varchar("name", { length: 100 }).notNull(),
	seller_id: int("seller_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	category: varchar("category", { length: 100 }).notNull(),
	price: decimal("price").notNull(),
	status: mysqlEnum("status", ITEM_STATUSES).notNull().default("pending"),
	image_url: text("image_url"),
	image_public_id: varchar("image_public_id", { length: 255 }),
	stock: int("stock").notNull(),
	description: varchar("description", { length: 1000 }),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
	id: int("id").primaryKey().autoincrement(),
	customer_id: int("customer_id").references(() => users.id, {
		onDelete: "set null",
	}),
	payment_method: mysqlEnum("payment_method", PAYMENT_METHODS).notNull(),
	total_price: decimal("total_price").notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = mysqlTable("order_items", {
	id: int("id").primaryKey().autoincrement(),
	order_id: int("order_id")
		.notNull()
		.references(() => orders.id, { onDelete: "cascade" }),
	item_id: int("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	seller_id: int("seller_id").references(() => users.id, {
		onDelete: "set null",
	}),
	quantity: int("quantity").notNull(),
	price: decimal("price").notNull(),
	subtotal: decimal("subtotal").notNull(),
	status: mysqlEnum("status", ORDER_ITEM_STATUSES).notNull().default("Pending"),
	created_at: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = mysqlTable("cart_items", {
	id: int("id").primaryKey().autoincrement(),
	user_id: int("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	item_id: int("item_id")
		.notNull()
		.references(() => items.id, { onDelete: "cascade" }),
	quantity: int("quantity").notNull(),
	added_at: timestamp("created_at").defaultNow().notNull(),
});
