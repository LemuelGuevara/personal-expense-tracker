import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/common",
  schema: "./src/db/schema/common/index.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_COMMON_DB_URL!,
    authToken: process.env.TURSO_COMMON_DB_TOKEN,
  },
});
