
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { accounts, users } from "$lib/db/schema";
import db from "$lib/db";
import { dbAsyncHandler } from "$lib/utils/server/handler";

export const checkHasPassword = dbAsyncHandler(async (email: string) => {
    const [existingUser] = await db().select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!existingUser) return false;

    const [existingAccount] = await db().select({ exists: sql<number>`1` }).from(accounts).where(and(eq(accounts.userId, existingUser.id), isNotNull(accounts.password))).limit(1)

    return !!existingAccount;
}, "checkHasPassword");