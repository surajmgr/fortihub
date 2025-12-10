import { eq, and, isNotNull, sql } from 'drizzle-orm';
import { accounts, users } from '$lib/db/schema';
import db from '$lib/db';
import { dbAsyncHandler } from '$lib/utils/server/handler';

export const checkHasPassword = dbAsyncHandler(async (email: string) => {
	const dbInstance = db();
	if (!dbInstance) throw new Error('DB instance not found');
	const [existingUser] = await dbInstance
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, email))
		.limit(1);
	if (!existingUser) return false;

	const [existingAccount] = await dbInstance
		.select({ exists: sql<number>`1` })
		.from(accounts)
		.where(and(eq(accounts.userId, existingUser.id), isNotNull(accounts.password)))
		.limit(1);

	return !!existingAccount;
}, 'checkHasPassword');
