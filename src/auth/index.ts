import { commonAuthDB } from "@/db";
import * as commonSchema from "@/db/schema/common";
import { betterAuth } from "better-auth";

import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { provisionUserDatabase } from "@/db/turso/provision-user-db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(commonAuthDB, {
    provider: "sqlite",
    schema: commonSchema,
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await provisionUserDatabase(user.id);
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [tanstackStartCookies()],
});
