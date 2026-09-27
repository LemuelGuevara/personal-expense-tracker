import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, timestamps } from "../columns";
import { accounts } from "./accounts";
import { sql } from "drizzle-orm";
import { categories } from "./categories";

export const transactionTypes = ["income", "expense", "transfer"] as const;
export type TransactionType = (typeof transactionTypes)[number];

export const transactions = sqliteTable(
  "transactions",
  {
    id: id(),
    type: text("type", { enum: transactionTypes }).notNull(),
    amount: integer("amount").notNull().default(0),
    accountId: text("account_id").references(() => accounts.id),
    toAccountId: text("to_account_id").references(() => accounts.id),
    categoryId: text("category_id").references(() => categories.id),
    description: text("description"),
    date: text("date").notNull(),
    notes: text("notes"),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => [
    index("transactions_account_id_date_idx").on(table.accountId, table.date),
    index("transactions_category_id_date_idx").on(table.categoryId, table.date),
    check(
      "transactions_to_account_check",
      sql`(${table.type} = 'transfer') = (${table.toAccountId} IS NOT NULL)`,
    ),
    check(
      "transactions_transfer_accounts_check",
      sql`${table.toAccountId} IS NULL OR ${table.toAccountId} != ${table.accountId}`,
    ),
    check(
      "transactions_transfer_category_check",
      sql`${table.type} != 'transfer' OR ${table.categoryId} IS NULL`,
    ),
  ],
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type UpdateTransaction = Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>;
