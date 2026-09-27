import { sql } from "drizzle-orm";
import { check, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { id, inList, timestamps } from "../columns";
import { transactions } from "./transactions";

export const installmentStatuses = ["active", "completed", "cancelled"] as const;
export type InstallmentStatus = (typeof installmentStatuses)[number];

export const installmentPlans = sqliteTable(
  "installment_plans",
  {
    id: id(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    categoryId: text("category_id").references(() => categories.id),
    description: text("description").notNull(),
    totalAmount: integer("total_amount").notNull(),
    interestRate: real("interest_rate").notNull().default(0),
    numTerms: integer("num_terms").notNull(),
    monthlyAmount: integer("monthly_amount").notNull(),
    startDate: text("start_date").notNull(),
    status: text("status", { enum: installmentStatuses }).notNull().default("active"),
    createdAt: timestamps.createdAt,
  },
  (table) => [
    check(
      "installment_plans_status_check",
      sql`${table.status} IN (${inList(installmentStatuses)})`,
    ),
    check("installment_plans_total_amount_check", sql`${table.totalAmount} > 0`),
    check("installment_plans_monthly_amount_check", sql`${table.monthlyAmount} > 0`),
    check("installment_plans_interest_rate_check", sql`${table.interestRate} >= 0`),
    check("installment_plans_num_terms_check", sql`${table.numTerms} > 0`),
  ],
);

export const installmentTerms = sqliteTable(
  "installment_terms",
  {
    id: id(),
    installmentPlanId: text("installment_plan_id")
      .notNull()
      .references(() => installmentPlans.id, { onDelete: "cascade" }),
    termNumber: integer("term_number").notNull(),
    dueDate: text("due_date").notNull(),
    amount: integer("amount").notNull(),
    isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
    transactionId: text("transaction_id")
      .unique()
      .references(() => transactions.id, { onDelete: "set null" }),
  },
  (table) => [
    uniqueIndex("installment_terms_plan_id_term_number_idx").on(
      table.installmentPlanId,
      table.termNumber,
    ),
    check("installment_terms_term_number_check", sql`${table.termNumber} >= 1`),
    check("installment_terms_amount_check", sql`${table.amount} > 0`),
  ],
);

export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type NewInstallmentPlan = typeof installmentPlans.$inferInsert;
export type UpdateInstallmentPlan = Partial<Omit<NewInstallmentPlan, "id" | "createdAt">>;

export type InstallmentTerm = typeof installmentTerms.$inferSelect;
export type NewInstallmentTerm = typeof installmentTerms.$inferInsert;
export type UpdateInstallmentTerm = Partial<Omit<NewInstallmentTerm, "id">>;
