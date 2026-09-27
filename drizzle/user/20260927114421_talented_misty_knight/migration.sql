CREATE TABLE `accounts` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`type` text NOT NULL,
	`starting_balance` integer DEFAULT 0 NOT NULL,
	`currency` text,
	`created_at` integer NOT NULL,
	CONSTRAINT "accounts_type_check" CHECK("type" IN ('cash', 'card', 'credit_card', 'debit_card', 'savings', 'others'))
);
--> statement-breakpoint
CREATE TABLE `credit_card_details` (
	`account_id` text PRIMARY KEY,
	`credit_limit` integer DEFAULT 0 NOT NULL,
	`statement_date` integer DEFAULT 1 NOT NULL,
	`due_date` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `fk_credit_card_details_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
	CONSTRAINT "credit_card_details_statement_date_check" CHECK("statement_date" BETWEEN 1 AND 31),
	CONSTRAINT "credit_card_details_due_date_check" CHECK("due_date" BETWEEN 1 AND 31)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` text PRIMARY KEY,
	`category_id` text NOT NULL,
	`amount` integer NOT NULL,
	`period` text NOT NULL,
	`start_date` text,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_budgets_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
	CONSTRAINT "budgets_amount_check" CHECK("amount" > 0),
	CONSTRAINT "budgets_period_check" CHECK("period" IN ('weekly', 'monthly', 'yearly'))
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`icon` text,
	`color` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `installment_plans` (
	`id` text PRIMARY KEY,
	`account_id` text NOT NULL,
	`category_id` text,
	`description` text NOT NULL,
	`total_amount` integer NOT NULL,
	`interest_rate` real DEFAULT 0 NOT NULL,
	`num_terms` integer NOT NULL,
	`monthly_amount` integer NOT NULL,
	`start_date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_installment_plans_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`),
	CONSTRAINT `fk_installment_plans_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
	CONSTRAINT "installment_plans_status_check" CHECK("status" IN ('active', 'completed', 'cancelled')),
	CONSTRAINT "installment_plans_total_amount_check" CHECK("total_amount" > 0),
	CONSTRAINT "installment_plans_monthly_amount_check" CHECK("monthly_amount" > 0),
	CONSTRAINT "installment_plans_interest_rate_check" CHECK("interest_rate" >= 0),
	CONSTRAINT "installment_plans_num_terms_check" CHECK("num_terms" > 0)
);
--> statement-breakpoint
CREATE TABLE `installment_terms` (
	`id` text PRIMARY KEY,
	`installment_plan_id` text NOT NULL,
	`term_number` integer NOT NULL,
	`due_date` text NOT NULL,
	`amount` integer NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	`transaction_id` text UNIQUE,
	CONSTRAINT `fk_installment_terms_installment_plan_id_installment_plans_id_fk` FOREIGN KEY (`installment_plan_id`) REFERENCES `installment_plans`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_installment_terms_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE SET NULL,
	CONSTRAINT "installment_terms_term_number_check" CHECK("term_number" >= 1),
	CONSTRAINT "installment_terms_amount_check" CHECK("amount" > 0)
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` text PRIMARY KEY,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`account_id` text NOT NULL,
	`to_account_id` text,
	`category_id` text,
	`description` text,
	`frequency` text NOT NULL,
	`next_due_date` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	CONSTRAINT `fk_recurring_transactions_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`),
	CONSTRAINT `fk_recurring_transactions_to_account_id_accounts_id_fk` FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`),
	CONSTRAINT `fk_recurring_transactions_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
	CONSTRAINT "recurring_transactions_type_check" CHECK("type" IN ('income', 'expense', 'transfer')),
	CONSTRAINT "recurring_transactions_frequency_check" CHECK("frequency" IN ('daily', 'weekly', 'monthly', 'yearly')),
	CONSTRAINT "recurring_transactions_amount_check" CHECK("amount" > 0),
	CONSTRAINT "recurring_transactions_to_account_check" CHECK(("type" = 'transfer') = ("to_account_id" IS NOT NULL)),
	CONSTRAINT "recurring_transactions_transfer_accounts_check" CHECK("to_account_id" IS NULL OR "to_account_id" != "account_id"),
	CONSTRAINT "recurring_transactions_transfer_category_check" CHECK("type" != 'transfer' OR "category_id" IS NULL)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `transaction_tags` (
	`transaction_id` text NOT NULL,
	`tag_id` text NOT NULL,
	CONSTRAINT `transaction_tags_pk` PRIMARY KEY(`transaction_id`, `tag_id`),
	CONSTRAINT `fk_transaction_tags_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_transaction_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY,
	`type` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`account_id` text,
	`to_account_id` text,
	`category_id` text,
	`description` text,
	`date` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_transactions_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`),
	CONSTRAINT `fk_transactions_to_account_id_accounts_id_fk` FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`),
	CONSTRAINT `fk_transactions_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
	CONSTRAINT "transactions_to_account_check" CHECK(("type" = 'transfer') = ("to_account_id" IS NOT NULL)),
	CONSTRAINT "transactions_transfer_accounts_check" CHECK("to_account_id" IS NULL OR "to_account_id" != "account_id"),
	CONSTRAINT "transactions_transfer_category_check" CHECK("type" != 'transfer' OR "category_id" IS NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `installment_terms_plan_id_term_number_idx` ON `installment_terms` (`installment_plan_id`,`term_number`);--> statement-breakpoint
CREATE INDEX `transactions_account_id_date_idx` ON `transactions` (`account_id`,`date`);--> statement-breakpoint
CREATE INDEX `transactions_category_id_date_idx` ON `transactions` (`category_id`,`date`);