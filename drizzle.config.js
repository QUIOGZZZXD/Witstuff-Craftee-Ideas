import { defineConfig } from "drizzle-kit";
import { environment } from "./api/constants/environment";

export default defineConfig({
  out: "./drizzle",
  schema: "./api/db/schema.js",
  dialect: "mysql",
  dbCredentials: {
    url: environment.DB_URL,
  },
});
