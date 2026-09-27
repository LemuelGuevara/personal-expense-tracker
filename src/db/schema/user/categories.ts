import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "../columns";

export const categories = sqliteTable("categories", {
  id: id(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  color: text("color"),
  createdAt: timestamps.createdAt,
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type UpdateCategory = Partial<Omit<NewCategory, "id" | "createdAt">>;
