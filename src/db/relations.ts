import { defineRelations } from "drizzle-orm";
import * as commonSchema from "./schema/common";
import * as userSchema from "./schema/user";

export const commonRelations = defineRelations(commonSchema);
export const userRelations = defineRelations(userSchema);
