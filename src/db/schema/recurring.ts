import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { id, inList } from "./columns";
import { transactionTypes } from "./transactions";

export const recurringFrequencies = ["daily", "weekly", "monthly", "yearly"] as const;
export type RecurringFrequency = (typeof recurringFrequencies)[number];

export const recurringTransactions = sqliteTable(
  "recurring_transactions",
  {
    id: id(),
    type: text("type", { enum: transactionTypes }).notNull(),
    amount: integer("amount").notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    toAccountId: text("to_account_id").references(() => accounts.id),
    categoryId: text("category_id").references(() => categories.id),
    description: text("description"),
    frequency: text("frequency", { enum: recurringFrequencies }).notNull(),
    nextDueDate: text("next_due_date").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  },
  (table) => [
    check("recurring_transactions_type_check", sql`${table.type} IN (${inList(transactionTypes)})`),
    check(
      "recurring_transactions_frequency_check",
      sql`${table.frequency} IN (${inList(recurringFrequencies)})`,
    ),
    check("recurring_transactions_amount_check", sql`${table.amount} > 0`),
    check(
      "recurring_transactions_to_account_check",
      sql`(${table.type} = 'transfer') = (${table.toAccountId} IS NOT NULL)`,
    ),
    check(
      "recurring_transactions_transfer_accounts_check",
      sql`${table.toAccountId} IS NULL OR ${table.toAccountId} != ${table.accountId}`,
    ),
    check(
      "recurring_transactions_transfer_category_check",
      sql`${table.type} != 'transfer' OR ${table.categoryId} IS NULL`,
    ),
  ],
);

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type NewRecurringTransaction = typeof recurringTransactions.$inferInsert;
export type UpdateRecurringTransaction = Partial<Omit<NewRecurringTransaction, "id">>;
