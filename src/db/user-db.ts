import { drizzle } from "drizzle-orm/libsql";
import { commonAuthDB } from "./index";
import { userRelations } from "./relations";

export type UserDB = ReturnType<typeof buildUserDB>;

const userDBCache = new Map<string, UserDB>();

function buildUserDB(hostname: string, authToken: string) {
  return drizzle({
    connection: { url: `libsql://${hostname}`, authToken },
    relations: userRelations,
  });
}

export async function getUserDB(userId: string) {
  const cached = userDBCache.get(userId);
  if (cached) return cached;

  const row = await commonAuthDB.query.user.findFirst({ where: { id: userId } });
  if (!row?.dbHostname || !row.dbToken) {
    throw new Error(`User ${userId} has no provisioned database`);
  }

  const db = buildUserDB(row.dbHostname, row.dbToken);
  userDBCache.set(userId, db);
  return db;
}
