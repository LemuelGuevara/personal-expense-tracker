import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
};

export const inList = (values: readonly string[]) =>
  sql.raw(values.map((v) => `'${v.replace(/'/g, "''")}'`).join(", "));
