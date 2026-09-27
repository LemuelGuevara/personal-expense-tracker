import { createClient } from "@tursodatabase/api";

export const turso = createClient({
  org: process.env.TURSO_ORG!,
  token: process.env.TURSO_PLATFORM_TOKEN!,
});
