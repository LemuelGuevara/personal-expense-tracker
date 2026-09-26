import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { id, inList, timestamps } from "./columns";
import { sql } from "drizzle-orm";

export const accountTypes = [
  "cash",
  "card",
  "credit_card",
  "debit_card",
  "savings",
  "others",
] as const;
export type AccountType = (typeof accountTypes)[number];

export const accounts = sqliteTable(
  "accounts",
  {
    id: id(),
    name: text("name").notNull().unique(),
    type: text("type", { enum: accountTypes }).notNull(),
    startingBalance: integer("starting_balance").notNull().default(0),
    currency: text("currency"),
    createdAt: timestamps.createdAt,
  },
  (table) => [check("accounts_type_check", sql`${table.type} IN (${inList(accountTypes)})`)],
);

export const creditCardDetails = sqliteTable(
  "credit_card_details",
  {
    accountId: text("account_id")
      .primaryKey()
      .references(() => accounts.id, { onDelete: "cascade" }),
    creditLimit: integer("credit_limit").notNull().default(0),
    statementDate: integer("statement_date").notNull().default(1),
    dueDate: integer("due_date").notNull().default(1),
  },
  (table) => [
    check("credit_card_details_statement_date_check", sql`${table.statementDate} BETWEEN 1 AND 31`),
    check("credit_card_details_due_date_check", sql`${table.dueDate} BETWEEN 1 AND 31`),
  ],
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type UpdateAccount = Partial<Omit<NewAccount, "id" | "createdAt">>;

export type CreditCardDetail = typeof creditCardDetails.$inferSelect;
export type NewCreditCardDetail = typeof creditCardDetails.$inferInsert;
export type UpdateCreditCardDetail = Partial<Omit<NewCreditCardDetail, "id" | "createdAt">>;
