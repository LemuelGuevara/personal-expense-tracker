import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { commonAuthDB } from "@/db";
import { userRelations } from "@/db/relations";
import { user } from "@/db/schema/common";
import { turso } from "./index";

export async function provisionUserDatabase(userId: string) {
  const dbName = `user-${userId.toLowerCase()}`;

  const database = await turso.databases.create(dbName, {
    group: process.env.TURSO_GROUP!,
  });
  const { jwt } = await turso.databases.createToken(dbName, {
    authorization: "full-access",
  });

  const client = drizzle({
    connection: {
      url: `libsql://${database.hostname}`,
      authToken: jwt,
    },
    relations: userRelations,
  });

  await migrate(client, { migrationsFolder: "./drizzle/user" });

  await commonAuthDB
    .update(user)
    .set({ dbHostname: database.hostname, dbToken: jwt })
    .where(eq(user.id, userId));

  return { ...database, authToken: jwt };
}
