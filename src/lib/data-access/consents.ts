import { eq, and } from 'drizzle-orm';
import { userConsents } from '$lib/db/schema';
import db from '$lib/db';
import { dbAsyncHandler } from '$lib/utils/server/handler';

export const updateUserConsent = dbAsyncHandler(
    async ({ userId, key, value }: { userId: string; key: string; value: string }) => {
        const dbInstance = db();
        if (!dbInstance) throw new Error('DB instance not found');

        const [existing] = await dbInstance
            .select()
            .from(userConsents)
            .where(and(eq(userConsents.userId, userId), eq(userConsents.key, key)))
            .limit(1);

        if (existing) {
            await dbInstance
                .update(userConsents)
                .set({ value, updatedAt: new Date() })
                .where(and(eq(userConsents.userId, userId), eq(userConsents.key, key)));
        } else {
            await dbInstance.insert(userConsents).values({
                id: crypto.randomUUID(),
                userId,
                key,
                value,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return true;
    },
    'updateUserConsent'
);
