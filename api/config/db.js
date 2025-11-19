import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/mysql2";
import MySQLStoreFactory from "express-mysql-session";
import session from "express-session";
import mysql from "mysql2/promise";
import { environment } from "../constants/environment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caPath =
  process.env.CA_CERT_PATH || path.join(__dirname, "../certs/ca.pem");

const dbOptions = {
  host: environment.DB_HOST,
  port: environment.DB_PORT,
  user: environment.DB_USER,
  password: environment.DB_PASS,
  database: environment.DB_NAME,
};

const MySQLStore = MySQLStoreFactory(session);
export const sessionStore = new MySQLStore({
  ...dbOptions,
  ssl: { ca: fs.readFileSync(caPath) },
});
const poolConnection = mysql.createPool(dbOptions);
export const db = drizzle(poolConnection);
