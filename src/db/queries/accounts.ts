import { eq } from "drizzle-orm";
import type { UserDB } from "../user-db";
import { accounts, type NewAccount, type UpdateAccount } from "../schema/user";

export const findAll = (db: UserDB) => db.query.accounts.findMany();

export const findById = (db: UserDB, id: string) => db.query.accounts.findFirst({ where: { id } });

export const create = async (db: UserDB, newAccount: NewAccount) =>
  (await db.insert(accounts).values(newAccount).returning())[0];

export const update = async (db: UserDB, id: string, updateAccount: UpdateAccount) =>
  (await db.update(accounts).set(updateAccount).where(eq(accounts.id, id)).returning())[0];

export const remove = (db: UserDB, id: string) => db.delete(accounts).where(eq(accounts.id, id));
