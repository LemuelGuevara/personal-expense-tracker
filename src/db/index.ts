import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { commonRelations } from "./relations";

export const commonAuthDB = drizzle({
  connection: {
    url: process.env.TURSO_COMMON_DB_URL!,
    authToken: process.env.TURSO_COMMON_DB_TOKEN,
  },
  relations: commonRelations,
});
