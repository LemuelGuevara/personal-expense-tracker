import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { categories } from "./categories";
import { id, inList, timestamps } from "../columns";

export const budgetPeriods = ["weekly", "monthly", "yearly"] as const;
export type BudgetPeriod = (typeof budgetPeriods)[number];

export const budgets = sqliteTable(
  "budgets",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    period: text("period", { enum: budgetPeriods }).notNull(),
    startDate: text("start_date"),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    check("budgets_amount_check", sql`${table.amount} > 0`),
    check("budgets_period_check", sql`${table.period} IN (${inList(budgetPeriods)})`),
  ],
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type UpdateBudget = Partial<Omit<NewBudget, "id" | "createdAt">>;
