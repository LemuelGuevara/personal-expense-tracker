import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id } from "../columns";
import { transactions } from "./transactions";

export const tags = sqliteTable("tags", {
  id: id(),
  name: text("name").notNull().unique(),
});

export const transactionTags = sqliteTable(
  "transaction_tags",
  {
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.transactionId, table.tagId] })],
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type UpdateTag = Partial<Omit<NewTag, "id">>;

export type TransactionTag = typeof transactionTags.$inferSelect;
export type NewTransactionTag = typeof transactionTags.$inferInsert;
